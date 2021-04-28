package com.example.polydessinmobile

import java.util.*
import kotlin.math.floor

class GameServer {
    constructor(mode: String, date: Date, players: MutableList<String>, pos: Int, score: Int, time: Int) {
        this.mode = mode
        this.date = date
        this.players = mutableListOf()
        for (p in players) this.players.add(p)
        this.position = pos
        this.score = score
        val min = floor(time.toFloat() / 60).toInt()
        var sec = (time - min * 60).toString()
        if (sec.length == 1) sec = "0$sec"
        this.time = "$min:$sec"
    }

    var mode: String
    var date: Date
    var players: MutableList<String>
    var position: Int
    var score: Int
    var time: String
}