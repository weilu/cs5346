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

- Data is grouped by streaming method and buffer configuration.
- Scatter plot with a trend line (aka regression line) is used for visualizing data points of each method and buffer configuration group. A scatter plot truthfully represent every single data point, while the the trend line provides a simple linear interpretation of the correlation between two quantitative variables to aid understanding of the data.
- By default only data of one group is shown. Data of other methods can be added/removed to/from the graph by clicking on the boxes in the legend. Different streaming methods are color-coded so their corresponding points and trend lines can be visually differentiated and compared in the plot.
- When multiple groups of data are visible in the plot, hovering over any point or line will highlight only visualization for that group and grey out all other groups. A tooltip will also present the name of the highlighted group and the values for the data point under the cursor. This is useful for when the user wants to inspect a single data point, such as an outlier. It's also useful to view a group of data points in the context of the rest of the rest of the data with minimal visual clutter.
- Similar to task 1, user can choose buffer configuration to display by clicking on the radio button in the legend.

## Task 4
We would like to know the methods which have the minimum number of stalls for video V7 under different network profiles. Draw appropriate plot for it.

- The data is first filtered to keep only rows of video V7. There is one data point, which is the number of stalls, for each given buffer configuration, network profile, and streaming method.
- A heatmap is chosen to visualize the methods with the minimum and maximum number of stalls under each network profile. The matrix created by the heatmap allows us to cross two categorical dimensions, namely network profile and streaming methods.
- The color of the tile represent the degree of stalls: dark green represents minimum number of stalls, white represents maximum number of stalls, while light green represents anything in between. This is explained by the legend at the bottom of the plot.
- Hovering over a tile provides additional information of exactly how many stalls there are for a given method, profile and buffer config.
- Similar to task 1 and 3, user can choose buffer configuration to display by clicking on the radio button in the legend.


[1]: https://www.jstor.org/stable/2685173
