import { AppState } from "./appState.js";
import { rgb, twoLevelCopyArr, uuidv4, blendColors, arePointsEqual } from "./utilities.js";

export class Episode {
  constructor(w, m, lw, lc, pts, selScale, selTrans, id) {
    this.world = w;
    this.mountains = m;
    this.lineWeight = lw;
    this.lineColor = lc;
    this.points = pts;
    this.selectionScale = selScale; 
    this.selectionTranslation = selTrans;
    this.identity = id;
    this.centerPoint = Episode.calcCenterPoint(pts);
    
    this.text = "";

    this.contourCurve = d3.line().curve(d3.curveBasisClosed);
  }

  static calcCenterPoint(pts) {
    let xSum = 0;
    let ySum = 0;
    for (let i = 0; i < pts.length; i++) {
      xSum += pts[i][0];
      ySum += pts[i][1];
    }

    let xCenter = xSum / pts.length;
    let yCenter = ySum / pts.length;
    return [xCenter, yCenter];
  }

  /// calculate the scale and translation transformations when the episode is selected 
  static calcScaleAndTranslationGivenPoints(pts) {
    let xMaxDist = 0;
    let yMaxDist = 0;

    for (let i = 0; i < pts.length; i++) {
      for (let j = i+1; j < pts.length; j++) {
        let xDist = Math.abs(pts[i][0] - pts[j][0]);
        let yDist = Math.abs(pts[i][1] - pts[j][1]);
        xMaxDist = Math.max(xMaxDist, xDist);
        yMaxDist = Math.max(yMaxDist, yDist);
      }
    }

    let scale;
    if ((xMaxDist / yMaxDist) > (AppState.width / AppState.height)) {
      // use X axis
      scale = (AppState.width) / xMaxDist;
    } else {
      // use Y axis
      scale = (AppState.height) / yMaxDist;
    }

    let xScreenCenter = AppState.width / 2;
    let yScreenCenter = AppState.height / 2; 

    let centerPoint = Episode.calcCenterPoint(pts);
    let translation = [xScreenCenter - centerPoint[0]*scale, yScreenCenter - centerPoint[1]*scale];
    return [scale, translation];
  }

  static combineEpisodePoints(eps1Points, eps2Points) {
    let minDistance = Infinity;
    let p1ForMinDist = [];
    let p2ForMinDist = [];
    for (let i = 0; i < eps1Points.length; i++) {
      for (let j = 0; j < eps2Points.length; j++) {
        let p1 = eps1Points[i];
        let p2 = eps2Points[j];
        let distance = Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
        if (distance < minDistance) {
          minDistance = distance;
          p1ForMinDist = p1;
          p2ForMinDist = p2;
        }
      }
    }

    // Step1:  move p1 to the end of points1, and p2 to the beginning of points2
    while (!arePointsEqual(eps1Points[eps1Points.length-1], p1ForMinDist)) {
      let p = eps1Points.shift();
      eps1Points.push(p);
    }
    while (!arePointsEqual(eps2Points[0], p2ForMinDist)) {
      let p = eps2Points.shift();
      eps2Points.push(p);
    }

    ////Step2: remove p1 and p2. this makes the connection wider
    // let endP1 = eps1Points.pop();
    // let startP2 = eps2Points.shift();
    // let middleP1 = [(endP1[0] * 2 + eps2.centerPoint[0])/3, (endP1[1] * 2 + eps2.centerPoint[1])/3];
    // let middleP2 = [(eps1.centerPoint[0] + startP2[0]*2)/3, (eps1.centerPoint[1] + startP2[1]*2)/3];
    // eps1Points.push(middleP1);
    // eps2Points.unshift(middleP2);

    // Step3: concat
    let combinedPoints = eps1Points.concat(eps2Points);
    
    return combinedPoints;
  }

  static combineEpisodes(eps1, eps2) {
    let combinedPoints = Episode.combineEpisodePoints(twoLevelCopyArr(eps1.points), twoLevelCopyArr(eps2.points));

    let transformData = Episode.calcScaleAndTranslationGivenPoints(twoLevelCopyArr(combinedPoints));
    let newEps = new Episode(eps1.world, 
      [...new Set(eps1.mountains.concat(eps2.mountains))], 
      (eps1.lineWeight + eps2.lineWeight)/2.0, 
      blendColors(eps1.lineColor, eps2.lineColor, 0.5), 
      combinedPoints, 
      transformData[0], 
      transformData[1],
      "episode".concat(uuidv4())); 

    newEps.text = eps1.text.concat(" ".concat(eps2.text));
    return newEps;
  }

  static calcLineWeightAndColor(totalCount, index) {
    let lc = Math.floor(175 + (80 / totalCount) * index);
    let lineColor = rgb(lc, lc, lc);
    let lineWidth = 0.9 + (0.9 / totalCount) * index;

    return [lineWidth, lineColor];
  }

  render(svg) {
    let thisObj = this;
    svg
    .append('path')
    .attr("id", thisObj.identity)
    .attr('d', thisObj.contourCurve(thisObj.points))
    .attr("stroke-linejoin", "round")
    .attr("fill", "black")
    .attr("stroke", thisObj.lineColor)
    .attr("stroke-width", thisObj.lineWeight)
    .on("click", function () {
      thisObj.world.selectEpisode(thisObj);
    })
    .on("mouseover", function() {
      d3
      .select('path#'.concat(thisObj.identity))
      .attr("fill", "grey");
    })
    .on("mouseout", function() {
      d3
      .select('path#'.concat(thisObj.identity))
      .attr("fill", "black");
    })
    .on("mousedown", function() {
      thisObj.world.combineEpisodeAtMtns(thisObj.identity, thisObj.mountainLabels());
    })
    .on("mouseup", function() {
      thisObj.world.combineWithEpisodeAtMtns(thisObj.identity, thisObj.mountainLabels());
    })
    .on("contextmenu", function(e) {
      e.preventDefault(); // prevent menu from popping out
      for (let i = 0; i < thisObj.mountains.length; i++) {
        thisObj.mountains[i].createAndPushNewEpisode();
      }
    });
  }

  animateSelectionContext(scale, translation) {
    let thisObj = this;

    d3
    .select('path#'.concat(thisObj.identity))
    .transition()
    .duration(1000)
    .attr("stroke-width", 1 / scale)
    .attr('transform', function(d, i) {
      return "translate(" + translation[0] + "," + translation[1] + ") scale(" + scale + ")";
    }); 
  }
  
  animateSelection() {
    let thisObj = this;
    
    d3
    .select('path#'.concat(thisObj.identity))
    .transition()
    .duration(1000)
    .attr("stroke-width", 1)
    .attr("stroke", rgb(255, 255, 255))
    .attr('transform', function(d, i) {
      return "translate(" + thisObj.selectionTranslation[0] + "," + thisObj.selectionTranslation[1] + ") scale(" + thisObj.selectionScale + ")";
    }) 
    .on("end", function(d) {
      AppState.textLabel.text(thisObj.text);
    });
  }

  refreshText() {
    AppState.textLabel.text(this.text);
  }

  /// the parameters are for the initial selected state
  animateUnselectionContext(scale, translation) {
    let thisObj = this;
    d3
      .select('path#'.concat(thisObj.identity))
      .attr("stroke-width", 1 / scale)
      .attr('transform', function(d, i) {
        return "translate(" + translation[0] + "," + translation[1] + ") scale(" + scale + ")";
      })
      .transition()
      .duration(1000)
      .attr("stroke-width", thisObj.lineWeight)
      .attr('transform', function(d, i) {
        return "translate(0,0) scale(1)";
      });
  }

  animateUnselection() {
    let thisObj = this;
    
    d3
    .select('path#'.concat(thisObj.identity))
    .attr("stroke-width", 1)
    .attr("stroke", rgb(255, 255, 255))
    .attr('transform', function(d, i) {
      return "translate(" + thisObj.selectionTranslation[0] + "," + thisObj.selectionTranslation[1] + ") scale(" + thisObj.selectionScale + ")";
    })
    .transition()
    .duration(1000)
    .attr("stroke-width", thisObj.lineWeight)
    .attr("stroke", thisObj.lineColor)
    .attr('transform', function(d, i) {
      return "translate(0,0) scale(1)";
    });
  }

  mountainLabels() {
    let output = [];
    for (let i = 0; i < this.mountains.length; i++) {
      output.push(this.mountains[i].label);
    }
    return output;
  }
}