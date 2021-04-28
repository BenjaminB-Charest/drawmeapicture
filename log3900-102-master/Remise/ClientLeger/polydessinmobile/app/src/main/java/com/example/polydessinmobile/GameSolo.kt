package com.example.polydessinmobile

import java.util.*

data class GameSolo(val correctAttempts: Int = 0,
                    val currentImageId: String = "",
                    val difficulty: String = "",
                    val end: Date = Date(System.currentTimeMillis()),
                    val host: String = "",
                    val score: Int = 0,
                    val start: Date = Date(System.currentTimeMillis()),
                    val state: Int = 0,
                    val totalAttempts: Int = 0
)