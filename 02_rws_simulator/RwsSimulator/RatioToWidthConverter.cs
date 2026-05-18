using System.Globalization;
using System.Windows.Data;

namespace RwsSimulator;

public class RatioToWidthConverter : IMultiValueConverter
{
    public object Convert(object[] values, Type targetType, object parameter, CultureInfo culture)
    {
        if (values[0] is double ratio && values[1] is double containerWidth)
            return Math.Max(0, Math.Min(ratio, 1.0) * containerWidth);
        return 0.0;
    }

    public object[] ConvertBack(object value, Type[] targetTypes, object parameter, CultureInfo culture)
        => throw new NotImplementedException();
}
