import { Component, Inject, OnInit, PLATFORM_ID, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { isPlatformBrowser } from '@angular/common';
import * as d3 from 'd3';

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  public dataSource = {
    datasets: [
      {
        data: [] as number[],
        backgroundColor: [
          '#ffcd56',
          '#ff6384',
          '#36a2eb',
          '#fd6b19',
          'Red',
          'Green',
          'purple'
        ]
      }
    ],
    labels: [] as string[],
  };

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any,
    private elRef: ElementRef // ElementRef to manipulate DOM for D3
  ) {}

  ngOnInit(): void {

    Chart.register(...registerables);

    this.http.get('http://localhost:3000/budget')
      .subscribe((res: any) => {
        console.log(res);
        for (var i = 0; i < res.myBudget.length; i++) {
          this.dataSource.datasets[0].data[i] = res.myBudget[i].budget;
          this.dataSource.labels[i] = res.myBudget[i].title;
        }

        this.createChart(); // Chart.js pie chart
        if (isPlatformBrowser(this.platformId)) {
          this.createD3Chart(); // D3.js chart
        }
      });
  }

  createChart() {
    if (isPlatformBrowser(this.platformId)) {
      const ctx = <HTMLCanvasElement>document.getElementById('myChart');
      var myPieChart = new Chart(ctx, {
        type: 'pie',
        data: this.dataSource
      });
    }
  }

  createD3Chart() {

    d3.select(this.elRef.nativeElement).select('svg').remove();

    // Create the chart container
    const width = 500;
    const height = 500;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(this.elRef.nativeElement)
      .select('#d3Chart')  // Targeting div with id 'd3Chart'
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);


    const color = d3.scaleOrdinal(this.dataSource.datasets[0].backgroundColor);


    const pie = d3.pie<any>()
      .value((d: any) => d);


    const arc = d3.arc<any>()
      .innerRadius(0)
      .outerRadius(radius);


    const arcs = svg.selectAll('arc')
      .data(pie(this.dataSource.datasets[0].data))
      .enter()
      .append('g')
      .attr('class', 'arc');


    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => color(i.toString()));

    arcs.append('text')
      .attr('transform', (d: any) => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text((d, i) => this.dataSource.labels[i]);
  }
}
