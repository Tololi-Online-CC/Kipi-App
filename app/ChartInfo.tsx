import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useLocalSearchParams } from 'expo-router';
import { Table, Rows } from 'react-native-reanimated-table';

interface SheetData {
    range: string;
    majorDimension: string;
    values: Array<Array<string>>;
}

const screenWidth = Dimensions.get('window').width;
const tableWidth = screenWidth * 0.95;

export default function UserProfile() {

    const { data, title, chartType } = useLocalSearchParams();


    let parsedData;
    // Parse the data if it's a string (it's passed as a string in the query)

    if (typeof data === 'string') {
        parsedData = JSON.parse(data);
    }

    const chartConfig = {
        backgroundGradientFrom: '#ffffff',
        backgroundGradientFromOpacity: 0,
        backgroundGradientTo: '#ffffff',
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 3,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        decimalPlaces: 0,
    };

    const renderLineChart = (data: SheetData | null, title: string | string[]) => {
        // Function to format the monetary values with commas
        const formatWithCommas = (value: number) => {
            return value.toLocaleString('en-US');
        };

        // Function to calculate the lowest, average, and highest values
        const calculateStats = () => {
            if (!data || !data.values || data.values.length === 0) {
                return {
                    lowest: 'N/A',
                    lowestLabel: 'N/A',
                    average: 'N/A',
                    highest: 'N/A',
                    highestLabel: 'N/A',
                };
            }

            const values = data.values.map((row) => parseFloat(row[1]));
            const labels = data.values.map((row) => row[0]);

            const indexOfLowest = values.indexOf(Math.min(...values));
            const indexOfHighest = values.indexOf(Math.max(...values));

            const lowestLabel = labels[indexOfLowest];
            const highestLabel = labels[indexOfHighest];

            const lowest = formatWithCommas(parseFloat(Math.min(...values).toFixed(2)));
            const highest = formatWithCommas(parseFloat(Math.max(...values).toFixed(2)));
            const average = formatWithCommas(parseFloat((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)));

            return {
                lowest,
                lowestLabel,
                average,
                highest,
                highestLabel,
            };
        };

        const stats = calculateStats();

        return (
            <>
                <Text style={styles.titleSmall}>{title}</Text>
                <View style={{ justifyContent: 'center' }}>
                    <LineChart
                        data={{
                            labels: data?.values.map((row) => row[0]) || [],
                            datasets: [{ data: data?.values.map((row) => parseFloat(row[1])) || [] }],
                        }}
                        width={screenWidth}
                        height={300}
                        yAxisLabel={'N$'}
                        chartConfig={chartConfig}
                        bezier
                    />
                </View>
                <Text style={styles.chartSummary}>Summary</Text>
                <View style={styles.highlightItem}>
                    <Text style={{ fontSize: 15 }}>
                        For the selected data chart,
                        the highest value is {stats.highest} and occurred at {stats.highestLabel}.
                        The average value is {stats.average}.
                        And the lowest value is {stats.lowest} and occurred at {stats.lowestLabel}.
                    </Text>
                </View>
            </>
        );
    };

    const renderBarChart = (data: SheetData | null, title: string | string[]) => {

        // Function to format the monetary values with commas
        const formatWithCommas = (value: number) => {
            return value.toLocaleString('en-US');
        };

        // Function to calculate the lowest, average, and highest values
        const calculateStats = () => {
            if (!data || !data.values || data.values.length === 0) {
                return {
                    lowest: 'N/A',
                    lowestLabel: 'N/A',
                    average: 'N/A',
                    highest: 'N/A',
                    highestLabel: 'N/A',
                };
            }

            const values = data.values.map((row) => parseFloat(row[1]));
            const labels = data.values.map((row) => row[0]);

            const indexOfLowest = values.indexOf(Math.min(...values));
            const indexOfHighest = values.indexOf(Math.max(...values));

            const lowestLabel = labels[indexOfLowest];
            const highestLabel = labels[indexOfHighest];

            const lowest = formatWithCommas(parseFloat(Math.min(...values).toFixed(2)));
            const highest = formatWithCommas(parseFloat(Math.max(...values).toFixed(2)));
            const average = formatWithCommas(parseFloat((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)));

            return {
                lowest,
                lowestLabel,
                average,
                highest,
                highestLabel,
            };
        };

        const stats = calculateStats();


        return (
            <>
                <Text style={styles.titleSmall}>{title}</Text>
                <View style={{ justifyContent: 'center' }}>
                    <BarChart
                        data={{
                            labels: data?.values.map((row) => row[0]) || [],
                            datasets: [{ data: data?.values.map((row) => parseFloat(row[1])) || [] }],
                        }}
                        width={screenWidth}
                        height={300}
                        yAxisLabel="$"
                        yAxisSuffix=""
                        chartConfig={chartConfig}
                    />
                </View>
                <Text style={styles.chartSummary}>Summary</Text>
                <View style={styles.highlightItem}>
                    <Text style={{ fontSize: 15 }}>
                        For the selected data chart,
                        the highest value is {stats.highest} and occurred at {stats.highestLabel}.
                        The average value is {stats.average}.
                        And the lowest value is {stats.lowest} and occurred at {stats.lowestLabel}.
                    </Text>
                </View>
            </>
        );
    };

    const renderTable = (data: SheetData | null, title: string | string[]) => {
        const tableData = data?.values || [];

        return (
            <View>
                <Text style={styles.titleSmall}>{title}</Text>
                <View style={styles.tableContainer}>
                    <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
                        <Rows data={tableData} textStyle={styles.rowStyle} />
                    </Table>
                </View>
            </View>
        );
    };

    const renderPieChart = (data: SheetData | null, title: string | string[]) => {
        const modernColors = [
            '#3498db', // Blue
            '#e74c3c', // Red
            '#2ecc71', // Green
            '#f39c12', // Yellow
            '#9b59b6', // Purple
            '#1abc9c', // Teal
            '#d35400', // Orange
            '#34495e', // Dark Gray
            '#95a5a6', // Light Gray
        ];

        const pieChartData = data?.values.map((row, index) => ({
            name: row[0],
            population: parseInt(row[1], 10),
            color: modernColors[index % modernColors.length], // Use modulo to repeat colors if needed
            legendFontColor: '#7F7F7F',
            legendFontSize: 14,
        })) || [];

        // Function to format the monetary values with commas
        const formatWithCommas = (value: number) => {
            return value.toLocaleString('en-US');
        };

        // Function to calculate the lowest, average, and highest values
        const calculateStats = () => {
            if (!data || !data.values || data.values.length === 0) {
                return {
                    lowest: 'N/A',
                    lowestLabel: 'N/A',
                    average: 'N/A',
                    highest: 'N/A',
                    highestLabel: 'N/A',
                };
            }

            const values = data.values.map((row) => parseFloat(row[1]));
            const labels = data.values.map((row) => row[0]);

            const indexOfLowest = values.indexOf(Math.min(...values));
            const indexOfHighest = values.indexOf(Math.max(...values));

            const lowestLabel = labels[indexOfLowest];
            const highestLabel = labels[indexOfHighest];

            const lowest = formatWithCommas(parseFloat(Math.min(...values).toFixed(2)));
            const highest = formatWithCommas(parseFloat(Math.max(...values).toFixed(2)));
            const average = formatWithCommas(parseFloat((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)));

            return {
                lowest,
                lowestLabel,
                average,
                highest,
                highestLabel,
            };
        };

        const stats = calculateStats();

        return (
            <View style={{ justifyContent: 'center' }}>
                <Text style={styles.titleSmall}>{title}</Text>
                <PieChart
                    data={pieChartData}
                    width={screenWidth * 0.9}
                    height={230}
                    chartConfig={chartConfig}
                    accessor={'population'}
                    backgroundColor={'transparent'}
                    paddingLeft=''
                    center={[5, 10]}
                />
                <Text style={styles.chartSummary}>Summary</Text>
                <View style={styles.highlightItem}>
                    <Text style={{ fontSize: 15 }}>
                        For the data chart,
                        the highest value is {stats.highest} and occurred at {stats.highestLabel}.
                        The average value is {stats.average}.
                        And the lowest value is {stats.lowest} and occurred at {stats.lowestLabel}.
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {
                chartType === 'line' ? (
                    <>
                        {renderLineChart(parsedData, title)}
                    </>
                ) : chartType === 'bar' ? (
                    <>
                        {renderBarChart(parsedData, title)}
                    </>
                ) : chartType === 'table' ? (
                    <>
                        {renderTable(parsedData, title)}
                    </>
                ) : chartType === 'pie' ? (
                    <>
                        {renderPieChart(parsedData, title)}
                    </>
                ) : (
                    <Text>No Chart Selected</Text>
                )
            }

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: 16,
    },
    contentContainer: {
        flex: 1,
        // alignItems: 'center',
        // justifyContent: 'center',
        marginHorizontal: 15,
        marginVertical: 20,
    },
    titleSmall: {
        fontSize: 24,
        marginTop: 15,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    chartSummary: {
        fontSize: 20,
        marginTop: 25,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    tableContainer: {
        width: tableWidth,
        flex: 1,
        paddingHorizontal: 5,
        // backgroundColor: '#fff',
        alignSelf: 'center',
    },
    rowStyle: {
        marginVertical: 5,
        marginHorizontal: 5,
        padding: 0,
        fontSize: 11,
    },
    highlightItem: {
        display: 'flex',
        backgroundColor: '#e0e0e0',
        paddingVertical: 16,
        paddingLeft: 15,
        paddingRight: 40,
        borderRadius: 8,
    },
});


