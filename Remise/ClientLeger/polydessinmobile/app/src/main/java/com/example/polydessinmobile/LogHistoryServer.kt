package com.example.polydessinmobile

import com.google.firebase.firestore.FieldValue
import java.util.*

class LogHistoryServer {
    constructor(date: Date, isLogin: Boolean) {
        this.date = date
        this.isLogin = isLogin
    }

    var date: Date
    var isLogin: Boolean
}