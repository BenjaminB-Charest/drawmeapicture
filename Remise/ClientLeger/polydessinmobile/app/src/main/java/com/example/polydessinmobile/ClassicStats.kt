package com.example.polydessinmobile

class ClassicStats {
    constructor(nbGamePlayed: Int, percentage: Float, totalTimeSecond: Int, bestScore: Int) {
        this.nbGamePlayed = nbGamePlayed
        this.percentageVictory = percentage
        this.totalTimeSecond = totalTimeSecond
        this.bestScore = bestScore
    }

    var nbGamePlayed: Int
    var percentageVictory: Float
    var totalTimeSecond: Int
    var bestScore: Int
}