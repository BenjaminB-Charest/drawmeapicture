package com.example.polydessinmobile

data class Lobby(val gameId: String = "",
                 val mode: String = "",
                 val difficulty: String = "",
                 val players: Map<String, Int> = mapOf("player1" to 0),
                 val host: String = "",
                 val name: String = "",
                 @field:JvmField
                 val isPublic: Boolean? = null,
                 val shareKey: String = ""
)