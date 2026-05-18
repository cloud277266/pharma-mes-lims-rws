namespace RwsSimulator.Models;

public class WeighingRecord
{
    public string OrderId { get; set; } = string.Empty;
    public string MaterialBarcode { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    public double TargetWeight { get; set; }
    public double TolerancePercent { get; set; }
    public double ActualWeight { get; set; }
    public string Operator { get; set; } = string.Empty;
    public DateTime CompletedAt { get; set; }
}
