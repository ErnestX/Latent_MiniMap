export class AppState {
    static width;
    static height;

    /// 0: default state
    /// 1: an episode is selected and displayed
    static state = 0; 

    /// Not null when and only when state = 1
    static selectedEpisode = null; 

    static textBuffer = "";
    static textLabel;

    static defaultEpisodeCountPerMountain = 1;
    static numOfMountainsToGenerate = 5;
}