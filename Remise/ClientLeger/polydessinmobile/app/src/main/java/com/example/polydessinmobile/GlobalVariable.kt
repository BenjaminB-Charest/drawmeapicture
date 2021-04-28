package com.example.polydessinmobile

import com.google.firebase.auth.ktx.auth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.ktx.Firebase
import java.lang.reflect.Field
import java.util.*

var loginDate: Date = Date(Firebase.auth.currentUser?.metadata?.lastSignInTimestamp as Long)
var isShowingAllMessages = false
var activeGameShareKey = ""
var activeGameName = ""
var loginServerId = ""
var isFirstOnStart = true
var shareKeysUser = mutableListOf<String>()
var isViewChannel = mutableMapOf<String, Boolean>()
