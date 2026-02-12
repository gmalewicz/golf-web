import { Component } from '@angular/core';  
  
@Component({  
  selector: 'app-mp-legend',  
   template: `
   <div class="row">  
  <div class="col-md-4">  
    <br />  
    <br />  
    <span>Additional Strokes:</span>  
    <br />  
  
    <table  
      id="legend-tbl"  
      class="table table-bordered"  
      aria-describedby="legend"  
    >  
      <thead>  
        <tr>  
          <th id="leg1" class="highlightHcp center">1</th>  
          <th id="leg2" class="highlightHcp2 center">2</th>  
          <th id="leg3" class="highlightHcp3 center">3</th>  
        </tr>  
      </thead>  
    </table>  
  </div>  
</div> 
   `
})  
export class MPLegendComponent {} 