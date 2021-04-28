package com.example.polydessinmobile

import java.util.*

class Message {
    constructor(date: Date, sender: String, content: String) {
        this.date = date
        this.sender = sender
        this.content = content
    }

    var date: Date
    var sender: String
    var content: String
}