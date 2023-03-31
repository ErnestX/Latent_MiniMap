import { rgb, twoLevelCopyArr, uuidv4 } from "./utilities.js";
import { Episode } from "./episode.js";

export class Mountain {
  constructor(w, bps, esCount, lbl){
    this.world = w;
    this.basePoints = bps;
    this.label = lbl;
    this.episodes = [];
    this.shiftCache = [];
    this.popCache = [];

    let basePointsAverage = this.calcBasePointsAverage();
    // init episodes
    for (let e = 0; e < esCount; e++) {
      let currentPoints = twoLevelCopyArr(this.basePoints);
      let eId = "episode".concat(uuidv4());
      for (let i = 0; i < currentPoints.length; i++) {
        currentPoints[i][0] += (basePointsAverage[0] - currentPoints[i][0]) / (esCount + 1) * (e + 1);
        currentPoints[i][1] += (basePointsAverage[1] - currentPoints[i][1]) / (esCount + 1) * (e + 1);
      }

      let lineProperties = Episode.calcLineWeightAndColor(esCount, e);
      let transformData = Episode.calcScaleAndTranslationGivenPoints(twoLevelCopyArr(currentPoints));

      this.episodes.push(new Episode(this.world, 
        [this], 
        lineProperties[0], 
        lineProperties[1], 
        twoLevelCopyArr(currentPoints), 
        transformData[0], 
        transformData[1], 
        eId)); 
    }
  } 

  calcBasePointsAverage() {
    let basePointsAverage = [0, 0];
    for (let i = 0; i < this.basePoints.length; i++) {
      basePointsAverage[0] += this.basePoints[i][0];
      basePointsAverage[1] += this.basePoints[i][1];
    }
    basePointsAverage[0] /= this.basePoints.length;
    basePointsAverage[1] /= this.basePoints.length;

    return basePointsAverage;
  }

  /// reassign the appearance of episodes
  reformEpisodes() {
    this.recoverEpisodes();

    let basePointsAverage = this.calcBasePointsAverage();

    for (let e = 0; e < this.episodes.length; e++) {
      let currentPoints = twoLevelCopyArr(this.basePoints);
      for (let i = 0; i < currentPoints.length; i++) {
        currentPoints[i][0] += (basePointsAverage[0] - currentPoints[i][0]) / (this.episodes.length+1) * (e+1);
        currentPoints[i][1] += (basePointsAverage[1] - currentPoints[i][1]) / (this.episodes.length+1) * (e+1);
      }

      let lineProperties = Episode.calcLineWeightAndColor(this.episodes.length, e);
      if (this.episodes[e].mountains.length <= 1) {
        let transformData = Episode.calcScaleAndTranslationGivenPoints(twoLevelCopyArr(currentPoints));
  
        this.episodes[e].lineWeight = lineProperties[0];
        this.episodes[e].lineColor = lineProperties[1];
        this.episodes[e].points = twoLevelCopyArr(currentPoints);
        this.episodes[e].selectionScale = transformData[0];
        this.episodes[e].selectionTranslation = transformData[1];
      } else {
        // this is a combined episode spanning across multiple mountains
        this.world.combiningQueue.push([
          this.label, 
          this.episodes[e].identity, 
          twoLevelCopyArr(currentPoints), 
          lineProperties[0], 
          lineProperties[1]]);

        this.world.processCombiningQueue();
      }
    }
    this.world.render();
  }

  /// Assume the mountains are different
  static combineEpisodes(mtns1, mtns2, epsId1, epsId2) {
    // must be different episodes! 
    if (epsId1 !== epsId2) {
      let combinedEps = Episode.combineEpisodes(mtns1[0].getEpisode(epsId1), mtns2[0].getEpisode(epsId2));
      // replace with combinedEps at each mountain
      for (let i = 0; i < mtns1.length; i++) {
        mtns1[i].replaceEpisodeAtIdWithEpisode(epsId1, combinedEps);
      }
      for (let i = 0; i < mtns2.length; i++) {
        mtns2[i].replaceEpisodeAtIdWithEpisode(epsId2, combinedEps);
      }
    }
  }

  replaceEpisodeAtIdWithEpisode(eIdToReplace, newEpisode) {
    for (let i = 0; i < this.episodes.length; i++) {
      if (this.episodes[i].identity === eIdToReplace) {
        this.episodes[i] = newEpisode;
      }
    }
  }

  recoverablePopAnEpisode() {
    let eps = this.episodes.pop();
    if (typeof eps !== 'undefined') {
      this.popCache.unshift(eps);
    }
    return eps;
  }

  recoverableShiftAnEpisode() {
    let eps = this.episodes.shift();
    if (typeof eps !== 'undefined') {
      this.shiftCache.push(eps);
    }
    return eps;
  }

  recoverablePopUntilEpisode(eId) {
    while (this.episodes.length > 0) {
      if (this.episodes[this.episodes.length-1].identity === eId) {
        return;
      } else {
        this.recoverablePopAnEpisode();
      }
    }
  }

  recoverEpisodes() {
    let eps;
    do {
      eps = this.shiftCache.pop();
      if (typeof eps !== 'undefined') {
        this.episodes.unshift(eps);
      }
    } while (typeof eps !== 'undefined')

    do {
      eps = this.popCache.shift();
      if (typeof eps !== 'undefined') {
        this.episodes.push(eps);
      }
    } while (typeof eps !== 'undefined')
  }

  animateSelectionWithTransformation(scale, translation) {
    for (let i = 0; i < this.episodes.length; i++) { 
      this.episodes[i].animateSelectionContext(scale, translation);
    }
  }

  /// the parameters are for the initial selected state
  animateUnselectionWithTransformation(scale, translation) {
    for (let i = 0; i < this.episodes.length; i++) { 
      this.episodes[i].animateUnselectionContext(scale, translation);
    }
  }

  getEpisode(eId) {
    for (let i = 0; i < this.episodes.length; i++){
      if (this.episodes[i].identity === eId) {
        return this.episodes[i];
      }
    }
    return null;
  }

  createAndPushNewEpisode() {
    this.episodes.push(new Episode(this.world, 
      [this], 
      1, 
      rgb(127, 127, 127), 
      this.basePoints, 
      1.0, 
      [0,0], 
      "episode".concat(uuidv4())));

    this.world.reformAllEpisodes();
  }
}