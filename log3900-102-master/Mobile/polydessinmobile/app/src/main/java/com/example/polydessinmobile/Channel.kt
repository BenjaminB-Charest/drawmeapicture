package com.example.polydessinmobile

data class Channel(val host: String = "",
                   @field:JvmField
                   val isPublic: Boolean? = null,
                   val name: String = "",
                   val shareKey: String = ""
)