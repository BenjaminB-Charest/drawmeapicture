package com.example.polydessinmobile

data class JoinGameItem(val name: String,
                        val players: Map<String, Int>,
                        val difficulty: String,
                        val isPublic: Boolean,
                        val shareKey: String,
                        val id: String)