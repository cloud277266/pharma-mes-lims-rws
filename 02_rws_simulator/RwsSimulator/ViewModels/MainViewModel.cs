using System.Collections.ObjectModel;
using System.Windows;
using System.Windows.Input;
using RwsSimulator.Commands;
using RwsSimulator.Models;

namespace RwsSimulator.ViewModels;

public class MainViewModel : BaseViewModel
{
    // ── 샘플 작업 지시서 데이터베이스 (실제 환경에서는 MES 연동) ──
    private static readonly Dictionary<string, WorkOrder> WorkOrders = new()
    {
        ["BC-RAW-001"] = new WorkOrder { OrderId = "WO-2026-001", MaterialBarcode = "BC-RAW-001", MaterialName = "정제수 (Purified Water)", TargetWeight = 500.0, TolerancePercent = 1.0 },
        ["BC-RAW-002"] = new WorkOrder { OrderId = "WO-2026-001", MaterialBarcode = "BC-RAW-002", MaterialName = "유당 (Lactose)", TargetWeight = 100.0, TolerancePercent = 1.0 },
        ["BC-RAW-003"] = new WorkOrder { OrderId = "WO-2026-002", MaterialBarcode = "BC-RAW-003", MaterialName = "전분 (Starch)", TargetWeight = 50.0, TolerancePercent = 2.0 },
        ["BC-RAW-004"] = new WorkOrder { OrderId = "WO-2026-002", MaterialBarcode = "BC-RAW-004", MaterialName = "스테아르산마그네슘", TargetWeight = 5.0, TolerancePercent = 5.0 },
    };

    // ── 상태 ──
    private string _barcodeInput = string.Empty;
    private string _actualWeightInput = string.Empty;
    private string _operatorName = "홍길동";
    private WorkOrder? _currentOrder;
    private string _statusMessage = "바코드를 스캔하여 시작하세요.";
    private bool _isBarcodeVerified;
    private bool _isCompleted;

    // ── 바코드 ──
    public string BarcodeInput
    {
        get => _barcodeInput;
        set => SetField(ref _barcodeInput, value);
    }

    public string OperatorName
    {
        get => _operatorName;
        set => SetField(ref _operatorName, value);
    }

    // ── 현재 작업 지시서 ──
    public WorkOrder? CurrentOrder
    {
        get => _currentOrder;
        private set
        {
            SetField(ref _currentOrder, value);
            OnPropertyChanged(nameof(HasOrder));
            OnPropertyChanged(nameof(OrderSummary));
        }
    }

    public bool HasOrder => _currentOrder != null;

    public string OrderSummary => _currentOrder == null
        ? "-"
        : $"{_currentOrder.MaterialName}  |  목표: {_currentOrder.TargetWeight:F1} g  |  허용: ±{_currentOrder.TolerancePercent}% ({_currentOrder.MinWeight:F2} ~ {_currentOrder.MaxWeight:F2} g)";

    // ── 실측값 ──
    public string ActualWeightInput
    {
        get => _actualWeightInput;
        set
        {
            SetField(ref _actualWeightInput, value);
            OnPropertyChanged(nameof(ActualWeight));
            OnPropertyChanged(nameof(WeightDelta));
            OnPropertyChanged(nameof(ToleranceStatus));
            OnPropertyChanged(nameof(ToleranceStatusColor));
            OnPropertyChanged(nameof(ProgressRatio));
            OnPropertyChanged(nameof(CanComplete));
        }
    }

    public double ActualWeight => double.TryParse(_actualWeightInput, out var v) ? v : 0;

    public double WeightDelta => CurrentOrder == null ? 0 : ActualWeight - CurrentOrder.TargetWeight;

    // ── [REQ-RWS-001] 허용 오차 판정 ──
    public bool IsWithinTolerance =>
        CurrentOrder != null &&
        ActualWeight >= CurrentOrder.MinWeight &&
        ActualWeight <= CurrentOrder.MaxWeight;

    public string ToleranceStatus
    {
        get
        {
            if (CurrentOrder == null || ActualWeight == 0) return "-";
            if (ActualWeight < CurrentOrder.MinWeight)
                return $"▼ 미달  ({WeightDelta:+0.000;-0.000} g)";
            if (ActualWeight > CurrentOrder.MaxWeight)
                return $"▲ 초과  ({WeightDelta:+0.000;-0.000} g)";
            return $"✔ 적합  ({WeightDelta:+0.000;-0.000} g)";
        }
    }

    public string ToleranceStatusColor =>
        CurrentOrder == null || ActualWeight == 0 ? "#9CA3AF" :
        IsWithinTolerance ? "#16A34A" : "#DC2626";

    public double ProgressRatio
    {
        get
        {
            if (CurrentOrder == null || CurrentOrder.TargetWeight == 0) return 0;
            return Math.Min(ActualWeight / CurrentOrder.TargetWeight, 1.5);
        }
    }

    // ── 상태 메시지 ──
    public string StatusMessage
    {
        get => _statusMessage;
        private set => SetField(ref _statusMessage, value);
    }

    public bool IsBarcodeVerified
    {
        get => _isBarcodeVerified;
        private set
        {
            SetField(ref _isBarcodeVerified, value);
            OnPropertyChanged(nameof(CanComplete));
        }
    }

    public bool IsCompleted
    {
        get => _isCompleted;
        private set => SetField(ref _isCompleted, value);
    }

    // ── [REQ-RWS-001] Hard-lock: 바코드 인증 + 허용 오차 내에서만 완료 가능 ──
    public bool CanComplete =>
        IsBarcodeVerified &&
        IsWithinTolerance &&
        !IsCompleted;

    // ── 완료 이력 ──
    public ObservableCollection<WeighingRecord> CompletedRecords { get; } = [];

    // ── Commands ──
    public ICommand ScanBarcodeCommand { get; }
    public ICommand CompleteWeighingCommand { get; }
    public ICommand ResetCommand { get; }

    public MainViewModel()
    {
        ScanBarcodeCommand = new RelayCommand(_ => ExecuteScan());
        CompleteWeighingCommand = new RelayCommand(_ => ExecuteComplete(), _ => CanComplete);
        ResetCommand = new RelayCommand(_ => ExecuteReset());
    }

    // ── [REQ-RWS-002] 바코드 검증 ──
    private void ExecuteScan()
    {
        var code = BarcodeInput.Trim();
        if (string.IsNullOrEmpty(code))
        {
            StatusMessage = "⚠ 바코드를 입력하세요.";
            return;
        }

        if (!WorkOrders.TryGetValue(code, out var order))
        {
            StatusMessage = $"✖ 등록되지 않은 바코드입니다: {code}";
            IsBarcodeVerified = false;
            CurrentOrder = null;
            return;
        }

        CurrentOrder = order;
        IsBarcodeVerified = true;
        ActualWeightInput = string.Empty;
        StatusMessage = $"✔ 바코드 인증 완료 — {order.MaterialName} ({order.OrderId})";
    }

    // ── 칭량 완료 처리 ──
    private void ExecuteComplete()
    {
        if (CurrentOrder == null || !CanComplete) return;

        var record = new WeighingRecord
        {
            OrderId = CurrentOrder.OrderId,
            MaterialBarcode = CurrentOrder.MaterialBarcode,
            MaterialName = CurrentOrder.MaterialName,
            TargetWeight = CurrentOrder.TargetWeight,
            TolerancePercent = CurrentOrder.TolerancePercent,
            ActualWeight = ActualWeight,
            Operator = OperatorName,
            CompletedAt = DateTime.Now,
        };

        CompletedRecords.Insert(0, record);
        IsCompleted = true;
        StatusMessage = $"✔ 칭량 완료 — 라벨 발행 준비됨";

        // 라벨 발행 팝업
        var labelWindow = new Views.LabelWindow(record) { Owner = Application.Current.MainWindow };
        labelWindow.ShowDialog();

        ExecuteReset();
    }

    private void ExecuteReset()
    {
        BarcodeInput = string.Empty;
        ActualWeightInput = string.Empty;
        CurrentOrder = null;
        IsBarcodeVerified = false;
        IsCompleted = false;
        StatusMessage = "바코드를 스캔하여 시작하세요.";
    }
}
