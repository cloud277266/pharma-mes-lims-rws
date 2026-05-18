namespace RwsSimulator.Models;

/// <summary>
/// 작업 지시서 — 칭량 대상 원료 정보
/// </summary>
public class WorkOrder
{
    public string OrderId { get; init; } = string.Empty;
    public string MaterialBarcode { get; init; } = string.Empty;
    public string MaterialName { get; init; } = string.Empty;
    public double TargetWeight { get; init; }
    public double TolerancePercent { get; init; }

    public double MinWeight => TargetWeight * (1 - TolerancePercent / 100.0);
    public double MaxWeight => TargetWeight * (1 + TolerancePercent / 100.0);
}
