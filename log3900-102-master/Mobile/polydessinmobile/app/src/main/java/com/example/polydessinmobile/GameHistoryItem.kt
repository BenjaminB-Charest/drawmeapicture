package com.example.polydessinmobile

// Revoir les types saved dans la BD
data class GameHistoryItem(val gameMode: String,
                           val date: String,
                           val players: MutableList<String>,
                           val finalPosition: Int,
                           val finalScore: Int,
                           val gameTime: String)