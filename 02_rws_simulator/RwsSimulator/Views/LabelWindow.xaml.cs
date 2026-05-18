using System.Windows;
using RwsSimulator.Models;

namespace RwsSimulator.Views;

public partial class LabelWindow : Window
{
    public LabelWindow(WeighingRecord record)
    {
        InitializeComponent();

        TxtOrderId.Text       = record.OrderId;
        TxtBarcode.Text       = record.MaterialBarcode;
        TxtMaterialName.Text  = record.MaterialName;
        TxtTarget.Text        = $"{record.TargetWeight:F1} g  (±{record.TolerancePercent}%)";
        TxtActual.Text        = $"{record.ActualWeight:F3} g";
        TxtOperator.Text      = record.Operator;
        TxtDate.Text          = record.CompletedAt.ToString("yyyy-MM-dd HH:mm:ss");
    }

    private void OnConfirmClick(object sender, RoutedEventArgs e) => Close();
}
