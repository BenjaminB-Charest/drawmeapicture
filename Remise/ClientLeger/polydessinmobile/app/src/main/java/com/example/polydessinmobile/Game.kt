package com.example.polydessinmobile

import java.util.*

data class Game(val difficulty: String = "",
                val mode: String = "",
                val round: Int = 0,
                val scores: Map<String, Int> = mapOf("player1" to 0),
                val players: Map<String, Int> = mapOf("player1" to 0),
                val roles: Map<String, String> = mapOf("player1" to "no role"),
                val nextEvent: Date = Date(System.currentTimeMillis()),
                val host: String = "",
                val start: Date = Date(System.currentTimeMillis()),
                val state: Int = 0,
                val currentImageId: String = ""
)