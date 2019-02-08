# CS5346 Information Visualisation Assignment 1

Lu Wei

## Development & Assessment

Make sure python3 is installed.

```bash
# unzip the submitted zip file
cd A0040955E_D3Assignment
python3 -m http.server
open http://localhost:8000/
```

Alternatively, visit https://weilu.github.io/cs5346/A1/ to view the visualizations.

Tested in Chrome and Firefox. Doesn't work on Microsoft Edge.

## Task 1

Draw plots to show the Average quality and number of changes in quality for a method. Each buffer configuration should have separate plot.

- Data is grouped by bufSize and method, then in each group avgQuality and avgChange are results of taking the mean of quality and change fields respectively.
- Bar chart is chosen as it allows quick visual comparison of quantitative data across a set of categories – in this case avgQuality/avgChange of various streaming methods.
- User can choose buffer configuration to display by clicking on the radio button in the legend on the top right corner.
- Similarly, user can choose whether to compare the average quality or average number of changes in quality by clicking on the radio buttons in the legend. It changes the y-axis.
- The global average across method is represented using the dashed line. It allows user to quickly identify which methods perform above/below average.

User can gain insigts throught interactions with the visualization, e.g. Method1 consistently underperforms in term of quality compared to the global average, and it also incurs more changes in quality when the buffer size is low (30/60/120). Though it incurs fewer changes when buffer size is big - 240, the average quality remains lowe. Therefore, we can conclude that Method1 offers low quality in all settings and it may have to do with the frequent changes during streaming.

## Task 2
Draw a single plot to show the Average QoE for a method grouped by different buffer configuration. The plot should be in such a way that we can compare the performance of the method with itself for different buffer configuration as well as with different methods within a buffer configuration.

- Similar to task 1, data is grouped by bufSize and method, then in each group I calculated several statistics, including mean, median, min, max, first and third quartile. Average gives us a snapshot of data. Including other stats gives us more information on the distribution of each group of data.
- Box plot is chosen, as it allows quick visual comparison of distributions among different groups of data. The whiskers represent min and max values for every group.
- Box plot usually uses median for the band inside the box, but [allows for mean to be optionally included][1]. I've included a radio button for users to switch between mean and median depending on their query.
- All there buffer configuration's box plots are grouped by method and placed side by side for quick comparison within a streaming method.
- Different buffer configurations are color-coded such that it's easy to compare within the same buffer config across different methods.
- Additionally, each buffer configuration display can be enabled and disabled by clicking on corresponding legend, which also acts as checkboxes. This provides users the option to view the plot with less clutter.

## Task 3
Draw plots to show the correlation between inefficiency and quality for all methods in different buffer configurations.

## Task 4
We would like to know the methods which have the minimum number of stalls for video V7 under different network profiles. Draw appropriate plot for it.


[1]: https://www.jstor.org/stable/2685173
