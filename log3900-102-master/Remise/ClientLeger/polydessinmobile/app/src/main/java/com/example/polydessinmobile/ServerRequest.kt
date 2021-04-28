package com.example.polydessinmobile

import android.content.Intent
import android.graphics.Color
import android.graphics.Point
import android.util.Log
import com.google.firebase.Timestamp
import com.google.firebase.auth.ktx.auth
import com.google.firebase.firestore.*
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.firestore.ktx.toObject
import com.google.firebase.ktx.Firebase
import java.lang.reflect.Array
import java.text.SimpleDateFormat
import java.util.*
import kotlin.collections.ArrayList
import kotlin.collections.HashMap

class ServerRequest {
    val documentUserProfil = Firebase.firestore.collection("userProfile")
    val username = Firebase.auth.currentUser?.email.toString().replace("@DrawMeAPicturePolyMTL.com".toLowerCase(), "")
    val documentImages = Firebase.firestore.collection("drawings-library")
    val documentLobbies = Firebase.firestore.collection("lobbies")
    val documentChannels = Firebase.firestore.collection("channels")
    val documentGames = Firebase.firestore.collection("games")
    val documentMessage = Firebase.firestore.collection("messages")
    val documentSoloGame = Firebase.firestore.collection("solo-games")
    val documentLoginHistory = Firebase.firestore.collection("loginHistory")
    var listenerMessage: ListenerRegistration = documentChannels.addSnapshotListener { value, error -> }
    var listenerMessageNotification: ListenerRegistration = documentChannels.addSnapshotListener { value, error -> }

    fun initListener() {
        listenerMessageNotification.remove()
        listenerMessage.remove()
    }

    fun setAvatar(avatar: String) {
        documentUserProfil.document(username).set(hashMapOf("avatar" to avatar), SetOptions.merge())
    }

    fun setSelectedBadges(selectedBadges: ArrayList<String>) {
        documentUserProfil.document(username).set(hashMapOf("selectedBadges" to selectedBadges), SetOptions.merge())
    }

    fun setToggleMusic(musicOn: Boolean) {
        documentUserProfil.document(username).set(hashMapOf("toggleMusic" to musicOn), SetOptions.merge())
    }

    fun setToggleVP(robotOn: Boolean) {
        documentUserProfil.document(username).set(hashMapOf("toggleVP" to robotOn), SetOptions.merge())
    }

    fun setImageId(gameId: String, imageId: String) {
        documentGames.document(gameId).set(hashMapOf("currentImageId" to imageId), SetOptions.merge())
    }

    fun setLobbyVirtualPlayer(lobbyId: String, playerUsername: String, index: Int, gameMode: String){
        documentLobbies.document(lobbyId).get().addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val document = task.result?.get("players") as MutableMap<String, Int>
                document[playerUsername] = index
                documentLobbies.document(lobbyId).update(mapOf(
                        "players" to document, "mode" to gameMode
                ))
            }
        }
    }

    fun setLobbyPlayer(lobbyId: String, playerUsername: String, index: Int){
        documentLobbies.document(lobbyId).get().addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val document = task.result?.get("players") as MutableMap<String, Int>
                document[playerUsername] = index
                documentLobbies.document(lobbyId).update(mapOf(
                    "players" to document
                ))
            }
        }
    }

    fun removeLobbyVirtualPlayer(lobbyId: String, playerUsername: String, gameMode: String){
        documentLobbies.document(lobbyId).get().addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val document = task.result?.get("players") as MutableMap<String, Int>
                document.remove(playerUsername)
                documentLobbies.document(lobbyId).update(mapOf(
                        "players" to document, "mode" to gameMode
                ))
            }
        }
    }

    fun removeLobbyPlayer(lobbyId: String, playerUsername: String){
        documentLobbies.document(lobbyId).get().addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val document = task.result?.get("players") as MutableMap<String, Number>
                var containsPlayer1 = false
                for(index in document.values){
                    if (index.toInt() == 1) containsPlayer1 = true
                }
                if(document[playerUsername]?.toInt() == 3 && containsPlayer1) {
                    val oldPlayer1Set = document.filterValues { it.toInt() == 1 }.keys
                    val oldPlayer1String = oldPlayer1Set.toString().subSequence(1, oldPlayer1Set.toString().length - 1).toString()
                    if(!oldPlayer1String.contains("[Robot]")){
                        document[oldPlayer1String] = 3
                    }
                }
                document.remove(playerUsername)
                documentLobbies.document(lobbyId).update(mapOf(
                    "players" to document
                ))
            }
        }
    }

    fun removeHost(lobbyId: String){
        documentLobbies.document(lobbyId).set(hashMapOf("host" to ""), SetOptions.merge())
    }

    fun setStroke(action: canvasAction, document: DocumentReference) {
        document.set(hashMapOf(
                "color" to Integer.toHexString(action.stroke.pencilColor).substring(2),
                "id" to action.stroke.id,
                "opacity" to action.stroke.pencilOpacity,
                "path" to action.stroke.pathPencil,
                "size" to action.stroke.pencilSize,
                "type" to action.type
        ))
    }

    fun getStrokeRealTime(myCallBack: MyCallBackCanvasAction, document: DocumentReference) {
        document.addSnapshotListener { snapshot, e ->
            if (e != null) return@addSnapshotListener
            if (snapshot != null && snapshot.exists()) {
                var arrayPos: MutableList<Vec2> = mutableListOf<Vec2>()
                for (o in (snapshot.data?.get("path") as ArrayList<HashMap<Float, Float>>)) {
                    arrayPos.add(Vec2(o.entries.toList()[0].toString().replace("x=", "").toFloat(), o.entries.toList()[1].toString().replace("y=", "").toFloat()))
                }
                var type: String = snapshot.data?.get("type").toString()
                if (type == "") type = CanvasActionType.Default.type
                myCallBack.onCallBack(
                        canvasAction(
                                Stroke(
                                        arrayPos,
                                        (snapshot.data?.get("opacity") as Any).toString().toDouble().toInt(),
                                        Color.parseColor("#" + (snapshot.data?.get("color") as Any).toString()),
                                        (snapshot.data?.get("size") as Any).toString().toFloat(),
                                        (snapshot.data?.get("id") as Any).toString().toDouble().toInt()
                                ),
                                CanvasActionType.valueOf(type)
                        )
                )
            }

        }
    }

    fun getStrokeRobot(myCallBack: MyCallBackCanvasActionList, document: DocumentReference) {
        document.get().addOnSuccessListener { document ->
            if (document != null && document.exists()) {
                var canvasActionsList: MutableList<canvasAction> = mutableListOf()
                val image = document.toObject<Image>()!!
                for (p in image.paths) {
                    var path: MutableList<Vec2> = mutableListOf()
                    for (point in p.path) {
                        path.add(Vec2(point.x, point.y))
                    }
                    canvasActionsList.add(canvasAction(Stroke(path, p.opacity.toInt(), Color.parseColor("#" + p.color), p.size, p.id.toInt()), CanvasActionType.valueOf(p.type)))
                }
                myCallBack.onCallBack(canvasActionsList)
            }
        }
    }

    fun getFirstName(myCallBack: MyCallBackString) {
        documentUserProfil.document(username).get().addOnSuccessListener { document ->
            if (document != null) {
                myCallBack.onCallBack(
                        document.data?.get("firstName").toString()
                )
            }
        }
    }

    fun getLastName(myCallBack: MyCallBackString) {
        documentUserProfil.document(username).get().addOnSuccessListener { document ->
            if (document != null) {
                myCallBack.onCallBack(
                        document.data?.get("lastName").toString()
                )
            }
        }
    }

    fun getAvatar(myCallBack: MyCallBackString) {
        documentUserProfil.document(username).get().addOnSuccessListener { document ->
            if (document != null) {
                var value = "male"
                if (document.data?.get("avatar") != null) value = document.data?.get("avatar").toString()
                myCallBack.onCallBack(value)
            }
        }
    }

    fun getMusicOn(myCallBack: MyCallBackBool) {
        documentUserProfil.document(username).get().addOnSuccessListener { document ->
            if (document != null && document.data != null && document.data!!["toggleMusic"] != null) {
                myCallBack.onCallBack(
                        document.data?.get("toggleMusic") as Boolean
                )
            }
        }
    }

    fun getRobotVoiceOn(myCallBack: MyCallBackBool) {
        documentUserProfil.document(username).get().addOnSuccessListener { document ->
            if (document != null) {
                myCallBack.onCallBack(
                        document.data?.get("toggleVP") as Boolean
                )
            }
        }
    }

    fun getAvatarUser(myCallBack: MyCallBackString, user: String) {
        documentUserProfil.document(user).get().addOnSuccessListener { document ->
            if (document != null) {
                myCallBack.onCallBack(
                        document.data?.get("avatar").toString()
                )
            }
        }
    }

    fun getUnlockedAvatar(myCallBack: MyCallBackStringArray) {
        documentUserProfil.document(username).get().addOnSuccessListener { document ->
            if (document != null) {
                myCallBack.onCallBack(
                    document.data?.get("unlockedAvatars") as ArrayList<String>
                )
            }
        }
    }

    fun getUnlockedBadges(myCallBack: MyCallBackStringArray) {
        documentUserProfil.document(username).get().addOnSuccessListener { document ->
            if (document != null) {
                myCallBack.onCallBack(
                        document.data?.get("unlockedBadges") as ArrayList<String>
                )
            }
        }
    }

    fun getSelectedBadges(myCallBack: MyCallBackStringArray, player: String) {
        documentUserProfil.document(player).get().addOnSuccessListener { document ->
            if (document != null) {
                myCallBack.onCallBack(
                        document.data?.get("selectedBadges") as ArrayList<String>
                )
            }
        }
    }

    fun getChannels(myCallBack: MyCallBackChannelsServer) {
        documentUserProfil.document(username).addSnapshotListener { document, e ->
            if (e != null) {
                Log.w("DocSnippets", "Listen failed.", e)
                return@addSnapshotListener
            }
            if (document != null) {
                var channelsArray = mutableListOf<ChannelServer>()
                val channelsID = document.data?.get("channels") as ArrayList<String>
                for (channel in channelsID) {
                    documentChannels.whereEqualTo("shareKey", channel)
                            .get()
                            .addOnSuccessListener { result ->
                                if (result.size() != 0) {
                                    for (doc in result) {
                                        val channel = doc.toObject<Channel>()
                                        channelsArray.add(ChannelServer(channel.name, channel.shareKey))
                                        if (result.indexOf(doc) == result.size() - 1) {
                                            myCallBack.onCallBack(
                                                    channelsArray
                                            )
                                        }
                                    }
                                }
                            }
                }
            }
        }
    }

    fun getUsernameEmail(): String {
        return Firebase.auth.currentUser?.email.toString().replace("@DrawMeAPicturePolyMTL.com".toLowerCase(), "")
    }

    fun getExperience(myCallBack: MyCallBackInt) {
        documentUserProfil.document(username).get().addOnSuccessListener { document ->
            if (document != null) {
                var value = 0
                if (document.data?.get("experience") != null) value = document.data?.get("experience").toString().toInt()
                myCallBack.onCallBack(value)
            }
        }
    }

    fun getMoney(myCallBack: MyCallBackInt) {
        documentUserProfil.document(username).get().addOnSuccessListener { document ->
            if (document != null) {
                myCallBack.onCallBack(
                        document.data?.get("money").toString().toInt()
                )
            }
        }
    }

    fun getWord(myCallBack: MyCallBackString, imageID: String){
        documentImages.document(imageID).get().addOnSuccessListener { document ->
            if (document != null) {
                myCallBack.onCallBack(
                    document.data?.get("word").toString()
                )
            }
        }
    }

    fun getHints(myCallBack: MyCallBackStringArray, imageID: String) {
        documentImages.document(imageID).get().addOnSuccessListener { document ->
            if (document != null) {
                myCallBack.onCallBack(
                    document.data?.get("hints") as ArrayList<String>
                )
            }
        }
    }

    fun channelsIsExisting(myCallBack: MyCallBackBool, shareKey: String) {
        documentChannels.get().addOnSuccessListener { document ->
            if (document != null) {
                var isExisting = false
                for (d in document) {
                    if (d.data?.get("shareKey").toString() == shareKey && d.data?.get("isPublic") as Boolean) {
                        isExisting = true
                        break
                    }
                }
                myCallBack.onCallBack(isExisting)
            }
        }
    }

    fun setChannelsUsers(shareKey: String) {
        documentUserProfil.document(getUsernameEmail()).get().addOnSuccessListener { document ->
            if (document != null) {
                if (!(document.data?.get("channels") as ArrayList<String>).contains(shareKey)) documentUserProfil.document(getUsernameEmail()).update("channels", FieldValue.arrayUnion(shareKey))
                shareKeysUser.add(shareKey)
            }
        }
    }

    fun addMessage(message: String, date: FieldValue, channel: String) {
        documentMessage.add(hashMapOf("channel" to channel, "content" to message, "senderID" to getUsernameEmail(), "timeStamp" to date))
    }

    fun addMessageSystem(message: String, date: FieldValue, channel: String, sender: String) {
        documentMessage.add(hashMapOf("channel" to channel, "content" to message, "senderID" to sender, "timeStamp" to date))
    }

    fun getMessages(myCallBackMessageList: MyCallBackMessageList, channel: String) {
        listenerMessage = documentMessage.addSnapshotListener { value, error ->
            if (error != null) {
                Log.w("DocSnippets", "Listen failed.", error)
                return@addSnapshotListener
            }
            if (value != null) {
                TimeZone.setDefault(TimeZone.getTimeZone("EST"))
                var messages = mutableListOf<Message>()
                for (d in value.documents) {
                    if (d.data?.get("channel").toString() == channel && d.data?.get("timeStamp") != null && ((d.data?.get("timeStamp") as Timestamp).toDate() > loginDate || isShowingAllMessages)) {
                        messages.add(Message(
                                (d.data?.get("timeStamp") as Timestamp).toDate(),
                                d.data?.get("senderID").toString(),
                                d.data?.get("content").toString()
                        ))
                    }
                }
                messages.sortBy { it.date }
                myCallBackMessageList.onCallBack(messages)
            }
        }
    }

    fun destroyListenerMessages() {
        listenerMessage.remove()
    }

    fun quitChannel(shareKey: String) {
        documentChannels.whereEqualTo("shareKey", shareKey).get().addOnSuccessListener { document ->
            if (document != null) {
                for (d in document) {
                    if (d.data?.get("host").toString() == getUsernameEmail()) {
                        d.reference.delete()
                        documentUserProfil.whereArrayContains("channels", shareKey).get().addOnSuccessListener { profil ->
                            if (profil != null) for (p in profil) p.reference.update("channels", FieldValue.arrayRemove(shareKey))
                        }
                    } else documentUserProfil.document(getUsernameEmail()).update("channels", FieldValue.arrayRemove(shareKey))
                    shareKeysUser.remove(shareKey)
                    isViewChannel.remove(shareKey)
                }
            }
        }
    }

    fun addChannel(isPublic: Boolean, name: String) {
        generateUniqueKey(object : MyCallBackString {
            override fun onCallBack(value: String) {
                documentChannels.add(hashMapOf("host" to getUsernameEmail(), "isPublic" to isPublic, "name" to name, "shareKey" to value))
                setChannelsUsers(value)
                shareKeysUser.add(value)
                isViewChannel.put(value, true)
            }
        })
    }

    fun generateKey(): String {
        val characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        var key = ""
        var count = 0
        while (count < 6) {
            key += characters[Math.floor(Math.random() * (characters.length - 1)).toInt()]
            count++
        }
        return key
    }

    fun generateUniqueKey(myCallBack: MyCallBackString) {
        documentChannels.get().addOnSuccessListener { document ->
            if (document != null) {
                var keys = mutableListOf<String>()
                for (d in document) keys.add(d.data?.get("shareKey").toString())
                var shareKey = generateKey()
                var isUnique = false
                while (!isUnique) {
                    isUnique = true
                    if (keys.contains(shareKey)) {
                        isUnique = false
                        shareKey = generateKey()
                    }
                }
                myCallBack.onCallBack(shareKey)
            }
        }
    }

    fun getClassicModeStats(myCallBackClassicStats: MyCallBackClassicStats) {
        documentGames.get().addOnSuccessListener { document ->
            if (document != null) {
                var nbGamePlayed = 0
                var nbGameWin = 0
                var totalTime = 0
                var bestScore = 0
                for (d in document) {
                    val users = d.data?.get("users") as ArrayList<String>
                    if (users.contains(getUsernameEmail())) {
                        nbGamePlayed++
                        var scoresTable = d.data?.get("scores") as Map<String, Float>
                        if (scoresTable[getUsernameEmail()].toString().toInt() > bestScore) bestScore = scoresTable[getUsernameEmail()].toString().toInt()
                        val playerList = d.data?.get("players") as Map<String, Float>
                        val teamUser = playerList[getUsernameEmail()].toString().toFloat().rem(2)
                        var scoreTeamUser = 0
                        var scoreOtherTeam = 0
                        for (p in playerList) {
                            if (p.value.rem(2) == teamUser) scoreTeamUser += scoresTable[p.key].toString().toInt()
                            else scoreOtherTeam += scoresTable[p.key].toString().toInt()
                        }
                        if (scoreTeamUser >= scoreOtherTeam) nbGameWin++
                        totalTime += ((d.data?.get("nextEvent") as Timestamp).seconds - (d.data?.get("start") as Timestamp).seconds).toInt()
                    }
                }
                val percentage: Float = if (nbGamePlayed != 0) nbGameWin.toFloat()/nbGamePlayed.toFloat() else 0F
                myCallBackClassicStats.onCallBack(ClassicStats(nbGamePlayed, percentage, totalTime, bestScore))
            }
        }
    }

    fun getSoloSprintStats(myCallBackSprintSoloStats: MyCallBackSprintSoloStats) {
        documentSoloGame.get().addOnSuccessListener { document ->
            if (document != null) {
                var nbGamePlayed = 0
                var totalTime = 0
                var bestScore = 0
                for (d in document) {
                    if (d.data?.get("host").toString() == getUsernameEmail() && d.data?.get("state").toString().toInt() == 4) {
                        nbGamePlayed++
                        totalTime += ((d.data?.get("end") as Timestamp).seconds - (d.data?.get("start") as Timestamp).seconds).toInt()
                        if (bestScore < d.data?.get("score").toString().toInt()) bestScore = d.data?.get("score").toString().toInt()
                    }
                }
                myCallBackSprintSoloStats.onCallBack(SprintSoloStats(nbGamePlayed, totalTime, bestScore))
            }
        }
    }

    fun addLoginHistory() {
        documentLoginHistory.add(hashMapOf("login" to FieldValue.serverTimestamp(), "logoff" to FieldValue.serverTimestamp(), "user" to getUsernameEmail())).addOnSuccessListener { document ->
            loginServerId = document.id
            Log.d("Main", loginServerId)
            isFirstOnStart = false
        }
    }

    fun setLoginHistory() {
        if (!isFirstOnStart) documentLoginHistory.document(loginServerId).update("logoff", FieldValue.serverTimestamp())
    }

    fun setIsLogginOn() {
        documentUserProfil.document(getUsernameEmail()).update("isLoggedIn", true)
    }

    fun setIsLogginOff() {
        documentUserProfil.document(getUsernameEmail()).update("isLoggedIn", false)
    }

    fun getIsLoggin(myCallBack: MyCallBackBool) {
        documentUserProfil.document(getUsernameEmail()).get().addOnSuccessListener { documentSnapshot ->
            if (documentSnapshot != null) {
                var value = false
                if (documentSnapshot.data?.get("isLoggedIn") != null) value = documentSnapshot.data?.get("isLoggedIn") as Boolean
                myCallBack.onCallBack(value)
            }
        }
    }

    fun getLoginIsLoggin(myCallBack: MyCallBackBool, username: String) {
        documentUserProfil.document(username).get().addOnSuccessListener { documentSnapshot ->
            if (documentSnapshot != null) {
                var value = false
                if (documentSnapshot.data?.get("isLoggedIn") != null) value = documentSnapshot.data?.get("isLoggedIn") as Boolean
                myCallBack.onCallBack(value)
            }
        }
    }

    fun getLoginHistory(myCallBackLoginHistoryList: MyCallBackLoginHistoryList) {
        documentLoginHistory.get().addOnSuccessListener { document ->
            if (document != null) {
                var buffer = mutableListOf<LogHistoryServer>()
                TimeZone.setDefault(TimeZone.getTimeZone("EST"))
                for (d in document) {
                    if (d.data?.get("user").toString() == getUsernameEmail()) {
                        buffer.add(LogHistoryServer((d.data?.get("login") as Timestamp).toDate(), true))
                        buffer.add(LogHistoryServer((d.data?.get("logoff") as Timestamp).toDate(), false))
                    }
                }
                buffer.sortBy { it.date }
                buffer.removeAt(buffer.size - 1)
                var bufferOfBuffer = buffer.asReversed()
                var logData = mutableListOf<LoginHistoryItem>()
                for (b in bufferOfBuffer) {
                    logData.add(LoginHistoryItem(b.isLogin, SimpleDateFormat("dd/MM/yyyy HH:mm").format(b.date)))
                }
                myCallBackLoginHistoryList.onCallBack(logData)
            }
        }
    }

    fun getGameHistoryClassic(myCallBackGameServerList: MyCallBackGameServerList) {
        documentGames.get().addOnSuccessListener { document ->
            var list = mutableListOf<GameServer>()
            if (document != null) {
                TimeZone.setDefault(TimeZone.getTimeZone("EST"))
                for (d in document) {
                    if ((d.data?.get("users") as ArrayList<String>).contains(getUsernameEmail())) {
                        var pos = 1
                        val userScore = (d.data?.get("scores") as Map<String, Float>).get(getUsernameEmail()).toString().toFloat()
                        for (user in d.data?.get("scores") as Map<String, Float>) if (userScore < user.value) pos++
                        val time = ((d.data?.get("nextEvent") as Timestamp).seconds - (d.data?.get("start") as Timestamp).seconds).toInt()
                        list.add(GameServer("Classic", (d.data?.get("start") as Timestamp).toDate(), d.data?.get("users") as MutableList<String>, pos, userScore.toInt(), time))
                    }
                }
            }
            myCallBackGameServerList.onCallBack(list)
        }
    }

    fun getGameHistory(myCallBackGameHistoryItemList: MyCallBackGameHistoryItemList) {
        getGameHistoryClassic(object : MyCallBackGameServerList {
            override fun onCallBack(value: MutableList<GameServer>) {
                documentSoloGame.get().addOnSuccessListener { document ->
                    var list = mutableListOf<GameServer>()
                    if (document != null) {
                        TimeZone.setDefault(TimeZone.getTimeZone("EST"))
                        for (d in document) {
                            if (d.data?.get("host").toString() == getUsernameEmail() && d.data?.get("state").toString().toInt() == 4) {
                                var player = mutableListOf<String>()
                                player.add(getUsernameEmail())
                                val time = ((d.data?.get("end") as Timestamp).seconds - (d.data?.get("start") as Timestamp).seconds).toInt()
                                list.add(GameServer("Solo Sprint", (d.data?.get("start") as Timestamp).toDate(), player, 0, d.data?.get("score").toString().toInt(), time))
                            }
                        }
                    }
                    list.addAll(value)
                    list.sortBy { it.date }
                    val buffer = list.asReversed()
                    var listToReturn = mutableListOf<GameHistoryItem>()
                    for (b in buffer) listToReturn.add(GameHistoryItem(b.mode, SimpleDateFormat("dd/MM/yyyy HH:mm").format(b.date), b.players, b.position, b.score, b.time))
                    myCallBackGameHistoryItemList.onCallBack(listToReturn)
                }
            }
        })
    }

    fun getChannelWithId(myCallBack: MyCallBackChannelServer, id: String) {
        documentChannels.document(id).get().addOnSuccessListener { document ->
            if (document != null) myCallBack.onCallBack(ChannelServer(document.data?.get("name").toString(), document.data?.get("shareKey").toString()))
        }
    }

    fun getIfHostChannel(myCallBack: MyCallBackBool, shareKey: String) {
        documentChannels.whereEqualTo("shareKey", shareKey).get().addOnSuccessListener { document ->
            if (document != null) {
                for (d in document) myCallBack.onCallBack(d.data?.get("host").toString() == getUsernameEmail())
            }
        }
    }

    fun listenToNewMessage(myCallBack: MyCallBackInt, myCallBackString: MyCallBackString) {
        listenerMessageNotification = documentMessage.addSnapshotListener { value, error ->
            if (error != null) {
                Log.w("DocSnippets", "Listen failed.", error)
                return@addSnapshotListener
            }
            if (value != null) {
                var counter = 0
                for (v in value.documentChanges) {
                    if (v.type == DocumentChange.Type.ADDED && shareKeysUser.contains(v.document.data?.get("channel").toString()) && v.document.data?.get("senderID") != getUsernameEmail()) {
                        counter++
                        myCallBackString.onCallBack(v.document.data?.get("channel").toString())
                    }
                }
                myCallBack.onCallBack(counter)
            }
        }
    }

    fun destroyNotificationListener() {
        listenerMessageNotification.remove()
    }

    fun getChannelsShareKeyUser(myCallBack: MyCallBackStringArray) {
        documentUserProfil.document(getUsernameEmail()).get().addOnSuccessListener { document ->
            if(document != null) myCallBack.onCallBack(document.data?.get("channels") as java.util.ArrayList<String>)
        }
    }

    fun listenHintsRobotsMessage(myCallBackMessage: MyCallBackMessage, shareKey: String) {
        documentMessage.addSnapshotListener { value, error ->
            if (error != null) {
                Log.w("DocSnippets", "Listen failed.", error)
                return@addSnapshotListener
            }
            if (value != null) {
                for (v in value.documentChanges) {
                    if (v.type == DocumentChange.Type.ADDED
                            && (v.document.data?.get("senderID").toString() == "Hint" || v.document.data?.get("senderID").toString().contains("[Robot]"))
                            && v.document.data?.get("channel").toString() == shareKey) {
                        if (v.document.data?.get("timeStamp") != null)
                            myCallBackMessage.onCallBack(Message((v.document.data?.get("timeStamp") as Timestamp).toDate(), v.document.data?.get("senderID").toString(), v.document.data?.get("content").toString()))
                        else myCallBackMessage.onCallBack(Message(Date(), v.document.data?.get("senderID").toString(), v.document.data?.get("content").toString()))
                    }
                }
            }
        }
    }

    fun deleteChannel(shareKey: String) {
        documentChannels.whereEqualTo("shareKey", shareKey).get().addOnSuccessListener { document ->
            if (document != null) for (d in document) d.reference.delete()
            documentUserProfil.whereArrayContains("channels", shareKey).get().addOnSuccessListener { document ->
                if (document != null) for (d in document) d.reference.update("channels", FieldValue.arrayRemove(shareKey))
            }
        }
    }

    fun getLastLogout(myCallBackTimeStamp: MyCallBackTimeStamp) {
        documentLoginHistory.whereEqualTo("user", getUsernameEmail()).get().addOnSuccessListener { document ->
            if (document != null) {
                var timestamp: Timestamp = Timestamp(Date())
                var isFirst = true
                for (d in document) {
                    if (isFirst) {
                        timestamp = d.data?.get("logoff") as Timestamp
                        isFirst = false
                    }
                    if (timestamp < d.data?.get("logoff") as Timestamp) timestamp = d.data?.get("logoff") as Timestamp
                }
                myCallBackTimeStamp.onCallBack(timestamp)
            }
        }
    }

    fun getMessageNotification(shareKeys: ArrayList<String>) {
        getLastLogout(object : MyCallBackTimeStamp {
            override fun onCallBack(value: Timestamp) {
                for (s in shareKeys) {
                    documentMessage.whereEqualTo("channel", s).get().addOnSuccessListener { document ->
                        if (document != null) {
                            var isSeen = true
                            for (d in document) if ((d.data?.get("timeStamp") as Timestamp) > value) isSeen = false
                            isViewChannel[s] = isSeen
                        }
                    }
                }
            }
        })
    }
}

interface MyCallBackString {
    fun onCallBack(value: String)
}

interface  MyCallBackInt {
    fun onCallBack(value: Int)
}

interface  MyCallBackBool {
    fun onCallBack(value: Boolean)
}

interface MyCallBackStringArray {
    fun onCallBack(value: ArrayList<String>)
}

interface MyCallBackCanvasAction {
    fun onCallBack(value: canvasAction)
}

interface MyCallBackCanvasActionList {
    fun onCallBack(value: MutableList<canvasAction>)
}

interface  MyCallBackMessageList {
    fun onCallBack(value: MutableList<Message>)
}

interface  MyCallBackMessage {
    fun onCallBack(value: Message)
}

interface  MyCallBackChannelServer {
    fun onCallBack(value: ChannelServer)
}

interface  MyCallBackChannelsServer {
    fun onCallBack(value: MutableList<ChannelServer>)
}

interface MyCallBackClassicStats {
    fun onCallBack(value: ClassicStats)
}

interface MyCallBackSprintSoloStats {
    fun onCallBack(value: SprintSoloStats)
}

interface MyCallBackLoginHistoryList {
    fun onCallBack(value: MutableList<LoginHistoryItem>)
}

interface MyCallBackGameServerList {
    fun onCallBack(value: MutableList<GameServer>)
}

interface MyCallBackGameHistoryItemList {
    fun onCallBack(value : MutableList<GameHistoryItem>)
}

interface MyCallBackTimeStamp {
    fun onCallBack(value : Timestamp)
}

data class Image(val authorId: String = "",
                 val difficulty: String = "",
                 val hints: ArrayList<String> = mutableListOf<String>() as ArrayList<String>,
                 val paths: ArrayList<Path> = mutableListOf<Path>() as ArrayList<Path>,
                 val word: String = ""
)

data class Path(val color: String = "",
                val id: Float = 1F,
                val opacity: Float = 255F,
                val path: List<Vec2Server> = mutableListOf(),
                val size: Float = 15F,
                val type: String = ""
)

data class Vec2Server(val x: Float = 0F,
                      val y: Float = 0F
)