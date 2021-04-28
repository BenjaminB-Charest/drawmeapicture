package com.example.polydessinmobile

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.graphics.*
import android.graphics.drawable.ColorDrawable
import android.media.AudioManager
import android.media.MediaPlayer
import android.os.Bundle
import android.os.SystemClock
import android.speech.tts.TextToSpeech
import android.text.method.ScrollingMovementMethod
import android.transition.Slide
import android.transition.TransitionManager
import android.util.Log
import android.util.TypedValue
import android.view.*
import android.widget.*
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.github.kittinunf.fuel.Fuel
import com.github.kittinunf.fuel.core.extensions.jsonBody
import com.google.firebase.auth.ktx.auth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.firestore.ktx.toObject
import com.google.firebase.ktx.Firebase
import kotlinx.android.synthetic.main.activity_lobby.*
import kotlinx.android.synthetic.main.activity_multiplayer_drawing.*
import kotlinx.android.synthetic.main.confirm_quit_channel.*
import kotlinx.android.synthetic.main.end_game_confirmation.*
import nl.dionsegijn.konfetti.models.Shape
import nl.dionsegijn.konfetti.models.Size
import java.lang.Math
import java.text.SimpleDateFormat
import java.util.*

open class MultiplayerDrawingActivity: CanvasDrawingActivity(), TextToSpeech.OnInitListener {

    // images array Classic Mode
    private var arrayImagesClassicMode = intArrayOf(
        R.drawable.h_drawer_tools,
        R.drawable.i_guess_word,
        R.drawable.k_whos_drawing,
        R.drawable.j_game_over
    )

    private var listOfTextClassicMode = arrayOf(
            "Game view: When drawing, the player has acces on a variety of tools for drawing such as the pencil, the eraser and the grid. You can also change the opacity of the tools.",
            "Game view: When guessing, the player can guess the word and can get a maximum of 3 hints.",
            "Game view: On the left side, the player can see who's turn it is.",
            "Game over: When the game is over, you can go back to the main menu."
    )

    private var indexClassicMode = 0

    private val username = ServerRequest().getUsernameEmail()


    // Chat
    lateinit var chatBox: TextView

    // music
    private lateinit var mediaPlayerMusic: MediaPlayer
    private  lateinit var mediaPlayerMusicGameOver:MediaPlayer
    private  lateinit var mediaPlayerMusicGuess:MediaPlayer
    private lateinit var mediaPlayerMusicReceiveMessage: MediaPlayer
    private  lateinit var mediaPlayerMusicGoodGuess:MediaPlayer
    private  lateinit var mediaPlayerMusicBadGuess:MediaPlayer
    private var musicOn = true
    private var robotVoiceOn = true
    var textToSpeech: TextToSpeech? = null

    // Game infos

    private val listPlayers = mutableListOf(PlayerGameItem(), PlayerGameItem(), PlayerGameItem(), PlayerGameItem())

    override var gameId: String = ""
    private lateinit var playerRole: String
    private val playerUsername = ServerRequest().getUsernameEmail()
    private lateinit var playerTeam: String
    private var gameState = 0
    private var gameRound = 0
    private lateinit var gameHost: String
    private var wordChoosed = false
    private var word = ""
    private var wordGuess = ""
    private var currentImage = ""
    private var gameDifficulty = ""
    private lateinit var hints : ArrayList<String>
    private var hintsLeft = 3
    private var chronometerValue: Long = 0
    private var isUpdatingTime = false
    private var canBeUpdate = true
    private val gameCollection = Firebase.firestore.collection("games")
    private var round: Int = 0
    private var shareKey = ""
    private var channelName = ""
    private var isJoining = true
    private var isFirstNewPage = true


    @ExperimentalStdlibApi
    @SuppressLint("ClickableViewAccessibility")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_multiplayer_drawing)

        Stroke.counter = -1

        showOrHideNotif()


        val Logintent = Intent(this, MainActivity::class.java)
        ServerRequest().getIsLoggin(object : MyCallBackBool {
            override fun onCallBack(value: Boolean) {
                if (!value) ServerRequest().setIsLogginOn()
                else {
                    startActivity(Logintent)
                    Firebase.auth.signOut()
                }
            }
        })

        gameId = intent.getStringExtra("gameId").toString()
        setGameID(gameId)

        gameCollection.document(gameId).addSnapshotListener { snapshot, e ->
            if (e != null) return@addSnapshotListener
            if (snapshot != null && snapshot.exists()) {
                isWriting = (snapshot.data?.get("roles") as Map<String, String>).get(username).toString() == "DP"
                if (snapshot.data?.get("round").toString().toInt() != round) {
                    round = snapshot.data?.get("round").toString().toInt()
                    reset()
                }
            }
        }

        title = "Classic Mode"

        setMusic()
        setRobotVoice()
        setSendSetting()
        setSeeMore()

        shareKey = activeGameShareKey
        channelName = activeGameName

        createCanvas()
        chat()
        setChannelsDropDown(findViewById<View>(android.R.id.content).rootView)
        setGeneralButtonsOnClickListeners()
        setChannelParameter()

        val docRef = Firebase.firestore.collection("games").document(gameId)

        var registration: ListenerRegistration? = null
        registration = docRef.addSnapshotListener { snapshot, e ->
            if (e != null) {
                return@addSnapshotListener
            }

            if (snapshot != null && snapshot.exists()) {

                val game = snapshot.toObject<Game>()!!

                gameHost = game.host
                gameDifficulty = game.difficulty
                currentImage = game.currentImageId

                chronometerValue = game.nextEvent.time - Date(System.currentTimeMillis()).time
                if(chronometerValue < 0) chronometerValue = 0

                wordChoosed = gameState == game.state

                gameState = game.state
                gameRound = game.round
                if (gameState == 8) {
                    for(player in game.players.keys){
                        listPlayers[game.players[player] ?: error("")].playerScore = game.scores[player] ?: error("")
                    }
                    showEndPopup()
                    registration?.remove()
                }
                else if (gameState == 7) endRound()
                else startNewState()

                var robotDidntDraw = true
                for(player in game.players.keys){
                    val playerIndex = game.players[player]

                    if (gameState == 2 && robotDidntDraw && player.contains("[Robot]") && (game.roles[player]?.contains("D") as Boolean)) {
                        drawImageRobot(currentImage, game.difficulty)
                        robotDidntDraw = false
                    }

                    if(gameState == 0){
                        listPlayers[playerIndex!!].playerUsername = player

                        if(game.players[player] ?: error("") == 0 || game.players[player] ?: error("") == 2) listPlayers[playerIndex].playerTeam = "teamA"
                        else listPlayers[playerIndex].playerTeam = "teamB"

                        ServerRequest().getAvatarUser(object : MyCallBackString{
                            override fun onCallBack(value: String) {
                                listPlayers[playerIndex].playerAvatar = value
                                if(game.players.keys.indexOf(player) == 3 && listPlayers[playerIndex].playerBadge1 != "") { // Dernier joueur dans la liste
                                    createPlayersList()
                                }
                            }
                        }, player)

                        if(!player.contains("[Robot]")){
                            ServerRequest().getSelectedBadges(object : MyCallBackStringArray{
                                override fun onCallBack(value: ArrayList<String>) {
                                    listPlayers[playerIndex].playerBadge1 = value[0]
                                    listPlayers[playerIndex].playerBadge2 = value[1]
                                    listPlayers[playerIndex].playerBadge3 = value[2]
                                    if(game.players.keys.indexOf(player) == 3 && listPlayers[playerIndex].playerAvatar != "") { // Dernier joueur dans la liste
                                        createPlayersList()
                                    }
                                }
                            }, player)
                        } else {
                            listPlayers[playerIndex].personality = getRobotPersonality(listPlayers[playerIndex].playerTeam)
                        }
                    }

                    if(game.roles[player].toString() == "DR" || game.roles[player].toString() == "DP"){
                        listPlayers[playerIndex!!].playerRole = "Drawing"
                    }
                    else if((game.roles[player].toString() == "G1" && gameState == 2) || (game.roles[player].toString() == "G2" && gameState == 4)){
                        listPlayers[playerIndex!!].playerRole = "Guessing"
                    }
                    else listPlayers[playerIndex!!].playerRole = "Watching"

                    listPlayers[playerIndex].playerScore = game.scores[player] ?: error("")

                    createPlayersList()

                    // Si le joueur est nous, on set la vue selon notre rôle
                    if(player == playerUsername){
                        playerRole = listPlayers[playerIndex].playerRole

                        setPlayerRole()
                        playerTeam = listPlayers[playerIndex].playerTeam

                        if(gameState == 1 || gameState == 2) {
                            ServerRequest().getWord(object : MyCallBackString {
                                override fun onCallBack(value: String) {
                                    word = value
                                    showStateMessage()
                                }
                            }, currentImage)

                            ServerRequest().getHints(object : MyCallBackStringArray {
                                override fun onCallBack(value: ArrayList<String>) {
                                    hints = value
                                    hintsLeft = 3
                                    setHintButton(give_hint_button, give_hints_left)
                                    setHintButton(ask_hint_button, ask_hints_left)
                                }
                            }, currentImage)
                        }
                        else showStateMessage()
                    }
                }
            }
        }

        chronometer_classic.setOnChronometerTickListener {
            if((chronometer_classic.text == "00:00" || chronometer_classic.text.contains("−")) && canBeUpdate) {
                chronometer_classic.stop()
                if(ServerRequest().getUsernameEmail() == gameHost && !isUpdatingTime){
                    isUpdatingTime = true
                    canBeUpdate = false
                    Fuel.post("https://us-central1-chat-b68d4.cloudfunctions.net/timerExpired")
                            .jsonBody("{ \"gameId\" : \"$gameId\" }")
                            .response { result -> isUpdatingTime = false }
                }
            } else canBeUpdate = true
        }

        mediaPlayerMusicGoodGuess = MediaPlayer.create(this, R.raw.good_guess)
        mediaPlayerMusicBadGuess = MediaPlayer.create(this, R.raw.bad_guess)
        mediaPlayerMusicReceiveMessage = MediaPlayer.create(this, R.raw.receive_message)

        ServerRequest().listenToNewMessage(object : MyCallBackInt {
            override fun onCallBack(value: Int) {
                if(value != 0 && !isFirstNewPage) mediaPlayerMusicReceiveMessage.start()
                isFirstNewPage = false
            }
        }, object : MyCallBackString {
            override fun onCallBack(value: String) {
                isViewChannel[value] = value == shareKey
                showOrHideNotif()
            }
        })

        ServerRequest().listenHintsRobotsMessage(object : MyCallBackMessage {
            override fun onCallBack(value: Message) {
                if(robotVoiceOn) speakOut(value.content)
                if(value.sender.contains("Hint")) updateViewHints()
            }
        }, activeGameShareKey)
    }

    private fun showOrHideNotif() {
        var showNotif = false
        for (i in isViewChannel) if (!i.value) showNotif = true
        if (showNotif) showNotification()
        else hideNotification()
    }

    override fun onRestart() {
        super.onRestart()
        val Logintent = Intent(this, MainActivity::class.java)
        ServerRequest().getIsLoggin(object : MyCallBackBool {
            override fun onCallBack(value: Boolean) {
                if (!value) ServerRequest().setIsLogginOn()
                else {
                    startActivity(Logintent)
                    Firebase.auth.signOut()
                }
            }
        })
    }

    private fun setChannelParameter() {
        channels_settings_classic.setOnClickListener {
            isJoining = true
            val inflater: LayoutInflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
            // Inflate a custom view using layout inflater
            val view = inflater.inflate(R.layout.chat_options_popup, null)

            // Initialize a new instance of popup window
            val popupWindow = PopupWindow(view, ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, true)
            createPopUpWindowTransitions(popupWindow)

            val okButton = view.findViewById<Button>(R.id.ok_chat_popup_game)
            okButton.setOnClickListener{
                popupWindow.dismiss()
            }

            setChannelOptionToggle(view)
            setQuitChannelButton(view)
            setChannelsDropDown(view)

            popupWindow.softInputMode = WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE

            // Show the popup window on app
            TransitionManager.beginDelayedTransition(multiplayer_activity_layout)
            popupWindow.showAtLocation(
                    multiplayer_activity_layout,
                    Gravity.CENTER,
                    0,
                    0)
        }
    }

    private fun setQuitChannelButton(view: View){
        val quitChannelButton = view.findViewById<Button>(R.id.quit_channel_button_game_popup)
        if(shareKey == "ABCDEF" || shareKey == activeGameShareKey){
            quitChannelButton.setBackgroundResource(R.drawable.quit_button_disabled)
        }
        else quitChannelButton.setBackgroundResource(R.drawable.quit_button_enabled)

        // TODO : Changer le channel actif pour le general channel
        quitChannelButton.setOnClickListener {
            if (shareKey == activeGameShareKey) showMessage("Can't quit the game Channel")
            else if (shareKey != "ABCDEF") {
                confirmationQuitChannelDialog()
            }
            else showMessage("Can't quit the General channel")
        }
    }

    private fun confirmationQuitChannelDialog(){
        val dialogs = Dialog(this)
        dialogs.requestWindowFeature(Window.FEATURE_NO_TITLE)
        dialogs.setContentView(R.layout.confirm_quit_channel)

        ServerRequest().getIfHostChannel(object : MyCallBackBool {
            override fun onCallBack(value: Boolean) {
                if (value) dialogs.quit_confirmation_message.text = dialogs.quit_confirmation_message.text.toString() + " Since you are the host, the channel will be deleted."
            }
        }, shareKey)

        dialogs.ok_quit_channel_confirmation_button.setOnClickListener {
            shareKey = activeGameShareKey
            dialogs.dismiss()
        }
        dialogs.cancel_quit_channel_confirmation_button.setOnClickListener {
            dialogs.dismiss()
        }
        dialogs.show()
    }

    private fun setChannelOptionToggle(view: View){
        val radioJoin = view.findViewById<RadioButton>(R.id.radio_join_game_popup)
        val radioCreate = view.findViewById<RadioButton>(R.id.radio_create_game_popup)
        val enterChannelButton = view.findViewById<ImageButton>(R.id.enter_channel_button_game_popup)
        val channelNameField = view.findViewById<EditText>(R.id.edit_text_channel_game_popup)
        radioJoin.setOnClickListener {
            enterChannelButton.setImageResource(R.drawable.ic_join)
            channelNameField.hint = "Channel key"
            isJoining = true
        }
        radioCreate.setOnClickListener {
            enterChannelButton.setImageResource(R.drawable.ic_add)
            channelNameField.hint = "Channel name"
            isJoining = false
        }

        enterChannelButton.setOnClickListener {
            joinOrCreateChannel(view)
        }

        channelNameField.setOnKeyListener(View.OnKeyListener { _, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_UP) {
                joinOrCreateChannel(view)
                return@OnKeyListener true
            }
            false
        })
    }

    private fun joinOrCreateChannel(view: View){
        val channelNameField = view.findViewById<EditText>(R.id.edit_text_channel_game_popup)
        if(isJoining){
            if(channelNameField.text.isNotEmpty()){
                val channelDropDown = view.findViewById<Spinner>(R.id.channel_drop_down_popup)
                // TODO : Trouver l'index du nouveau channel dans la liste de channels et le définir comme actif

                ServerRequest().channelsIsExisting(object: MyCallBackBool {
                    override fun onCallBack(value: Boolean) {
                        if (value) {
                            ServerRequest().setChannelsUsers(channelNameField.text.toString())
                            channelNameField.text.clear()
                        }
                        else showMessage("The key you entered is not valid.")
                    }
                }, channelNameField.text.toString().toUpperCase())

                //channelDropDown.setSelection(2)
            }
            else showMessage("Please the name of the channel you want to join.")
        }
        else{
            if(channelNameField.text.isNotEmpty()){
                // TODO : Trouver l'index du nouveau channel dans la liste de channels et le définir comme actif

                //channelDropDown.setSelection(2)
                ServerRequest().addChannel(true, channelNameField.text.toString())
                channelNameField.text.clear()
            }
            else showMessage("Please the name of the channel you want to create.")
        }
    }

    private fun showMessage(message: String?) {
        val root = findViewById<View>(android.R.id.content)
        val toast = Toast.makeText(this, message, Toast.LENGTH_SHORT)
        val yOffset = 0.coerceAtLeast(root.height - toast.yOffset)
        toast.setGravity(Gravity.TOP or Gravity.CENTER_HORIZONTAL, 0, yOffset)
        toast.show()
    }

    private fun setSeeMore() {
        see_more_classic.setOnClickListener {
            isShowingAllMessages = true
            ServerRequest().getMessages(object : MyCallBackMessageList {
                override fun onCallBack(value: MutableList<Message>) {
                    showAllMessageChannel(value)
                }
            }, shareKey)
        }
    }

    private fun setSendSetting() {
        send_button_multiplayer.setOnClickListener {
            sendMessage(FieldValue.serverTimestamp(), shareKey, message_eddittext_multiplayer)
        }

        message_eddittext_multiplayer.setOnKeyListener(View.OnKeyListener { _, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_UP) {
                sendMessage(FieldValue.serverTimestamp(), shareKey, message_eddittext_multiplayer)
                return@OnKeyListener true
            }
            false
        })
    }

    private fun sendMessage(date: FieldValue, channel: String, editTextBox: EditText) {
        wordGuess = editTextBox.text.toString()
        if(wordGuess.isNotBlank()) {
            ServerRequest().addMessage(editTextBox.text.toString(), date, channel)
            if(playerRole == "Guessing" && channel == activeGameShareKey) {
                if (wordGuess.toLowerCase() == word.toLowerCase()) mediaPlayerMusicGoodGuess.start()
                else mediaPlayerMusicBadGuess.start()
                guessWord()
            }
        }
        editTextBox.text.clear()
    }

    private fun endRound() {
        hints_shared.text = ""
        startNewState()
    }

    private fun startNewState(){
        startChronometer()
    }

    private fun startChronometer(){
        chronometer_classic.isCountDown = true
        chronometer_classic.base = SystemClock.elapsedRealtime() + chronometerValue
        chronometer_classic.start()
    }

    @ExperimentalStdlibApi
    private fun setPlayerRole(){
        if(playerRole == "Drawing" && (gameState == 2 || gameState == 4)){
            showDrawerTools()
            setDrawingTools()
            ask_hint_button.visibility = View.INVISIBLE
            ask_hints_left.visibility = View.INVISIBLE
            setNotGuessingChat()
        }
        else if (playerRole == "Guessing") {
            hideDrawerTools()
            setGuessingTools()
        }
        else { // Watcher
            hideDrawerTools()
            send_button_multiplayer.text = "Send"
            ask_hint_button.visibility = View.INVISIBLE
            ask_hints_left.visibility = View.INVISIBLE
            setNotGuessingChat()
        }
    }

    private fun showStateMessage(){
        when(gameState){
            0 -> word_to_guess.text = "Get ready..."
            1 -> word_to_guess.text = "Drawer getting ready..."
            2, 4 -> {
                if(playerRole == "Drawing") word_to_guess.text = "Word to draw : " + word
                else word_to_guess.text = "Word to guess : " + wordInUnderscore(word)
            }
            3, 5 -> word_to_guess.text = "Correct guess! The word was $word"
            6 -> word_to_guess.text = "No one guessed... The word was " + word
            7 -> {
                if(gameRound == 3) word_to_guess.text = "The last round is over!"
                else word_to_guess.text = "The round is over... Get ready for next round!"
            }
            8 -> word_to_guess.text = "Game over"
        }
    }

    // PLAYERS
    private fun createPlayersList(){
        val listPlayersCopy = listPlayers.toMutableList()
        listPlayersCopy.sortByDescending { it.playerScore }
        recycler_view_players.adapter = PlayerCardAdapter(listPlayersCopy) // Prend en paramètre un MutableList<PlayerGameItem>
        recycler_view_players.layoutManager = LinearLayoutManager(this)
        recycler_view_players.setHasFixedSize(true)
    }

    private fun showEndPopup() {
        view_konfetti_classic.build()
                .addColors(
                        Color.YELLOW,
                        Color.GREEN,
                        Color.BLUE,
                        Color.MAGENTA,
                        Color.RED,
                        Color.CYAN
                )
                .setDirection(0.0, 359.0)
                .setSpeed(3f, 8f)
                .setFadeOutEnabled(true)
                .setTimeToLive(2000L)
                .addShapes(Shape.Square, Shape.Circle)
                .addSizes(Size(12))
                .setPosition(-50f, view_konfetti_classic.width + 50f, -50f, -50f)
                .streamFor(800, 4000L)

        createMusicEndGame()

        val inflater: LayoutInflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        val view = inflater.inflate(R.layout.end_game_popup, null)

        val popupWindow = PopupWindow(view, ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, false)

        val okButton = view.findViewById<Button>(R.id.ok_end_game_button)
        okButton.setOnClickListener{
            ServerRequest().deleteChannel(activeGameShareKey)
            Log.d("Main", activeGameShareKey)
            ServerRequest().quitChannel(activeGameShareKey)
            mediaPlayerMusic.pause()
            mediaPlayerMusicGameOver.pause()
            popupWindow.dismiss()
            finish()
            startActivity(Intent(this, MainMenuActivity::class.java))
        }

        val gameResult = view.findViewById<TextView>(R.id.game_result)
        var ptsA = 0
        var ptsB = 0
        for(player in listPlayers){
            if(player.playerTeam == "teamA") ptsA += player.playerScore
            else ptsB += player.playerScore
        }

        if((playerTeam == "teamA" && (ptsA > ptsB)) || (playerTeam == "teamB" && (ptsB > ptsA))) gameResult.text = "Your team won " + Math.max(ptsA, ptsB) + " - " + Math.min(ptsA, ptsB) + " !"
        else if (ptsA == ptsB) gameResult.text = "It's a tie! Both teams got " + ptsA + " points!"
        else gameResult.text = "Your team lost " + Math.max(ptsA, ptsB) + " - " + Math.min(ptsA, ptsB) + " !"

        popupWindow.isOutsideTouchable = false
        popupWindow.elevation = 10F
        window.setFlags(WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE, WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE)

        // Finally, show the popup window on app
        TransitionManager.beginDelayedTransition(multiplayer_activity_layout)
        popupWindow.showAtLocation(
                multiplayer_activity_layout, // Location to display popup window
                Gravity.CENTER, // Exact position of layout to display popup
                0, // X offset
                0 // Y offset
        )
        showPlayersEndGame(view)
    }

    // RAGE QUIT
    override fun onBackPressed() { // Back button dans la barre noire en bas
        confirmationExitDialog()
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean { // Back button dans la action bar en haut
        when (item.itemId) {
            android.R.id.home -> confirmationExitDialog()
        }
        return true
    }

    private fun confirmationExitDialog(){
        val dialogs = Dialog(this)
        dialogs.requestWindowFeature(Window.FEATURE_NO_TITLE)
        dialogs.setContentView(R.layout.end_game_confirmation)

        dialogs.ok_end_game_confirmation_button.setOnClickListener {
            ServerRequest().quitChannel(activeGameShareKey)
            ServerRequest().deleteChannel(activeGameShareKey)
            Fuel.post("https://us-central1-chat-b68d4.cloudfunctions.net/quitGame")
                    .jsonBody("{ \"gameId\" : \"$gameId\", \"quitterUsername\" : \"$playerUsername\" }")
                    .response { result -> Log.d("DocSnippets", result.toString()) }
            dialogs.dismiss()
        }
        dialogs.cancel_end_game_confirmation_button.setOnClickListener {
            dialogs.dismiss()
        }
        dialogs.show()
    }

    private fun showPlayersEndGame(view: View){
        val recyclerViewPlayersEnd = view.findViewById<RecyclerView>(R.id.recycler_view_players_end)
        val listPlayersCopy = listPlayers.toMutableList()
        listPlayersCopy.sortByDescending { it.playerScore }
        recyclerViewPlayersEnd.adapter = PlayerEndAdapter(listPlayersCopy) // Prend en paramètre un MutableList<PlayerGameItem>
        recyclerViewPlayersEnd.layoutManager = LinearLayoutManager(this)
        recyclerViewPlayersEnd.setHasFixedSize(true)
    }

    // CHANNELS
    private fun setChannelsDropDown(views: View) {
        ServerRequest().getChannels(object: MyCallBackChannelsServer {
            override fun onCallBack(value: MutableList<ChannelServer>) {
                var list = mutableListOf<String>()
                list.add("$channelName  | Key :  $shareKey")
                for (v in value) if (v.key != shareKey) list.add(v.name + "  | Key :  " + v.key)
                val adapter:ArrayAdapter<String> = object: ArrayAdapter<String>(baseContext, R.layout.spinner_layout, list){
                    override fun getDropDownView(
                            position: Int,
                            convertView: View?,
                            parent: ViewGroup
                    ): View {
                        val view:TextView = super.getDropDownView(position, convertView, parent) as TextView
                        // set items properties
                        view.setTextSize(TypedValue.COMPLEX_UNIT_SP,20F)
                        view.setPadding(20, 20, 20, 20)

                        val channelDropDown : Spinner  = if(views != findViewById<View>(android.R.id.content).rootView) views.findViewById<Spinner>(R.id.channel_drop_down_game_popup)
                        else views.findViewById(R.id.channelDropDown)

                        // set selected item style
                        if (position == channelDropDown.selectedItemPosition) {
                            view.background = ColorDrawable(ContextCompat.getColor(context, R.color.colorPrimaryMedium))
                        }
                        return view
                    }
                }

                val channelDropDown = if(views != findViewById<View>(android.R.id.content).rootView)views.findViewById<Spinner>(R.id.channel_drop_down_game_popup)
                else views.findViewById(R.id.channelDropDown)

                // finally, data bind spinner with adapter
                channelDropDown.adapter = adapter

                channelDropDown.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
                    override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                        for (v in value) {
                            if (parent?.getItemAtPosition(position).toString().contains(v.key)) {
                                shareKey = v.key
                                channelName = v.name
                            }
                        }
                        isViewChannel[shareKey] = true
                        showOrHideNotif()
                        if(views != findViewById<View>(android.R.id.content).rootView) setQuitChannelButton(views)
                        ServerRequest().destroyListenerMessages()
                        isShowingAllMessages = false
                        ServerRequest().getMessages(object : MyCallBackMessageList {
                            override fun onCallBack(value: MutableList<Message>) {
                                showAllMessageChannel(value)
                            }
                        }, shareKey)
                    }
                    override fun onNothingSelected(parent: AdapterView<*>?) {}
                }
            }
        })

    }

    private fun showAllMessageChannel(messages: MutableList<Message>) {
        chatBox.text = ""
        for (v in messages) textBoxShowChat("[${SimpleDateFormat("HH:mm:ss").format(v.date)}] ${v.sender} : ${v.content}")
    }

    private fun setMusic(){
        mediaPlayerMusic =  MediaPlayer.create(this, R.raw.avicii)
        mediaPlayerMusic.isLooping = true

        // Afficher le paramètre de musique
        ServerRequest().getMusicOn(object : MyCallBackBool{
            override fun onCallBack(value: Boolean) {
                musicOn = value
                if(musicOn) {
                    mediaPlayerMusic.start()
                    music_button.setImageResource(R.drawable.ic_music)
                    music_button.setPadding(15, 15, 18, 15)
                }
                else{
                    music_button.setImageResource(R.drawable.ic_music_off)
                    music_button.setPadding(15, 15, 5, 15)
                }
            }
        })
    }

    private fun setRobotVoice(){
        // Initialize Text to speech
        textToSpeech = TextToSpeech(this, this)
        ServerRequest().getRobotVoiceOn(object : MyCallBackBool{
            override fun onCallBack(value: Boolean) {
                robotVoiceOn = value
                if (robotVoiceOn) {
                    robot_voice_button.setImageResource(R.drawable.ic_robot_voice_on)
                    robot_voice_button.setPadding(17, 12, 12, 14)
                } else {
                    robot_voice_button.setImageResource(R.drawable.ic_robot_voice_off)
                    robot_voice_button.setPadding(8, 8, 8, 8)
                }
            }
        })
    }

    // CHAT

    @ExperimentalStdlibApi
    private fun chat() {

        message_eddittext_multiplayer.setOnKeyListener(View.OnKeyListener { _, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_UP) {
                sendMessage(FieldValue.serverTimestamp(), shareKey, message_eddittext_multiplayer)
                return@OnKeyListener true
            }
            false
        })

        send_button_multiplayer.setOnClickListener {
            sendMessage(FieldValue.serverTimestamp(), shareKey, message_eddittext_multiplayer)
        }

        chatBox = findViewById(R.id.chatMessages)
        chatBox.movementMethod = ScrollingMovementMethod()
    }

    private fun guessWord(){
        if(wordGuess.isNotEmpty() && shareKey == activeGameShareKey){
            if(wordGuess.toLowerCase() == word.toLowerCase()) ServerRequest().addMessageSystem("Good guess! The word was $word", FieldValue.serverTimestamp(), shareKey, "System")
            else if (gameState == 2) ServerRequest().addMessageSystem("Wrong guess! Next guesser...", FieldValue.serverTimestamp(), shareKey, "System")
            else if (gameState == 4 && gameRound != 3) ServerRequest().addMessageSystem("Wrong guess! The word was $word", FieldValue.serverTimestamp(), shareKey, "System")
            else ServerRequest().addMessageSystem("Wrong guess!", FieldValue.serverTimestamp(), shareKey, "System")
            Fuel.post("https://us-central1-chat-b68d4.cloudfunctions.net/guessWord")
                    .jsonBody("{ \"gameId\" : \"$gameId\", \"guesserUsername\" : \"" + playerUsername + "\", \"word\" : \"" + wordGuess.toLowerCase() + "\" }")
                    .responseString { _, _, result ->
                        Log.d("DocSnippets", result.get())
                    }
            wordGuess = ""
        }
    }

    private fun textBoxShowChat(message: String) {
        val newTextBox = chatBox.text.toString() + "\n" + message
        chatBox.setText(newTextBox).toString()
    }

    // GUESSER

    private fun setGuessingTools(){
        send_button_multiplayer.text = "Guess"
        message_eddittext_multiplayer.hint = "Enter your guess"
        ask_hint_button.visibility = View.VISIBLE
        ask_hints_left.visibility = View.VISIBLE
    }

    private fun setNotGuessingChat(){
        send_button_multiplayer.text = "Send"
        message_eddittext_multiplayer.hint = "Enter your message"
    }

    // GUESSER OR WATCHER

    private fun hideDrawerTools() {
        drawer_tools.visibility = View.GONE
        undo_button.visibility = View.GONE
        redo_button.visibility = View.GONE
    }

    private fun showDrawerTools() {
        drawer_tools.visibility = View.VISIBLE
        undo_button.visibility = View.VISIBLE
        redo_button.visibility = View.VISIBLE
    }

    // HINTS

    private fun setHintButton(hintButton: ImageButton, nbHintsLeft: TextView){
        nbHintsLeft.text = hintsLeft.toString()
        if(hintsLeft != 0) {
            setEnabled(hintButton)
            hintButton.setOnClickListener {
                sendHint()
            }
        }
        else {
            hintButton.isClickable = false
            setDisabled(hintButton)
            nbHintsLeft.visibility = View.GONE
        }
    }

    private fun sendHint(){
        val newHint = hints[hints.size - hintsLeft]
        ServerRequest().addMessageSystem("Hint is : $newHint", FieldValue.serverTimestamp(), shareKey, "Hint")
    }

    private fun updateViewHints(){
        if(hintsLeft != 0){
            var hint = hints[hints.size - hintsLeft]
            hint = if (hintsLeft == hints.size){ // Si c'est le premier hint qu'on donne
                hints_shared.setBackgroundResource(R.color.white)
                "Hints : $hint"
            } else {
                ", $hint"
            }
            hints_shared.text = hints_shared.text.toString() + hint

            hintsLeft -= 1
            setHintButton(give_hint_button, give_hints_left)
            setHintButton(ask_hint_button, ask_hints_left)
        }
    }

    private fun setGeneralButtonsOnClickListeners(){
        robot_voice_button.setOnClickListener {
            robotVoiceOn = !robotVoiceOn
            if(robotVoiceOn){
                robot_voice_button.setImageResource(R.drawable.ic_robot_voice_on)
                robot_voice_button.setPadding(17, 12, 12, 14)
            }
            else{
                robot_voice_button.setImageResource(R.drawable.ic_robot_voice_off)
                robot_voice_button.setPadding(8, 8, 8, 8)
            }
        }

        music_button.setOnClickListener {
            musicOn = !musicOn
            if(musicOn){
                music_button.setImageResource(R.drawable.ic_music)
                music_button.setPadding(15, 15, 22, 15)
                mediaPlayerMusic.start()
            }
            else{
                music_button.setImageResource(R.drawable.ic_music_off)
                music_button.setPadding(15, 15, 5, 15)
                mediaPlayerMusic.pause()
            }
        }

        //************************ Pop up **********************************
        // Initialize a new layout inflater instance of chat popup
        val inflater: LayoutInflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        tutorialPopUp(inflater)

        mediaPlayerMusicGuess = MediaPlayer.create(this, R.raw.message_sent)
    }

    private fun setDisabled(v: ImageView) {
        v.setBackgroundResource(R.drawable.rounded_corners_button_pale_yellow_no_border)
        val matrix = ColorMatrix()
        matrix.setSaturation(0f) //0 means grayscale
        val cf = ColorMatrixColorFilter(matrix)
        v.colorFilter = cf
        v.imageAlpha = 128 // 128 = 0.5
    }

    private fun setEnabled(v: ImageView) {
        v.setBackgroundResource(R.drawable.rounded_corners_button_yellow)
        v.colorFilter = null
        v.imageAlpha = 255
    }

    private fun wordInUnderscore(word: String): String {
        var wordUnderscore = ""
        for(char in word){
            if(char != ' ') wordUnderscore += "_ "
            else wordUnderscore += "  "
        }
        return wordUnderscore
    }

    // ********************* Text to speech *******************************

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS){
            val result = textToSpeech!!.setLanguage(Locale.US)

            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED){
                Log.e("TTS", "The language is not supported")
            }
        }
        else{
            Log.e("TTS", "Initialisation failed")
        }
    }

    // Text to speech
    private fun speakOut(text: String){
        val am = getSystemService(AUDIO_SERVICE) as AudioManager
        val amStreamMusicMaxVol = am.getStreamMaxVolume(AudioManager.STREAM_NOTIFICATION)
        am.setStreamVolume(AudioManager.STREAM_MUSIC, amStreamMusicMaxVol, 0)
        textToSpeech!!.speak(text, TextToSpeech.QUEUE_ADD, null, "")
    }

    public override fun onDestroy() {
        if (textToSpeech != null){
            textToSpeech!!.stop()
            textToSpeech!!.shutdown()
        }
        super.onDestroy()
        ServerRequest().destroyNotificationListener()
    }

    override fun onPause() {
        super.onPause()
        ServerRequest().setLoginHistory()
        ServerRequest().setIsLogginOff()
    }

    private fun createMusicEndGame(){
        mediaPlayerMusic.pause()
        mediaPlayerMusicGameOver =  MediaPlayer.create(this, R.raw.uplifting_music)
        mediaPlayerMusicGameOver.isLooping = true
        if(musicOn) mediaPlayerMusicGameOver.start()
    }

    private fun getRobotPersonality(team: String): String{
        return when(gameId[0].toLowerCase()){
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm' -> {
                if(team == "teamA") "Sad"
                else "Arrogant"
            }
            'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' -> {
                if(team == "teamA") "Arrogant"
                else "Funny"
            }
            else -> {
                if(team == "teamA") "Funny"
                else "Sad"
            }
        }
    }

    private fun showNotification(){
        notification_popup_classic.visibility = View.VISIBLE
    }

    private fun hideNotification(){
        notification_popup_classic.visibility = View.GONE
    }

    // *************************** Tutorial Pop Up ***********************************************
    private fun tutorialPopUp(inflater: LayoutInflater) {
        tutorial_button.setOnClickListener {

            // Inflate a custom view using layout inflater
            val view = inflater.inflate(R.layout.tutorial_multiplayer, null)

            // Initialize a new instance of popup window
            val popupWindow = PopupWindow(view, ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, true)
            popupWindow.isOutsideTouchable = true
            message_eddittext_multiplayer.isEnabled = false
            tutorial_button.isEnabled = false
            music_button.isEnabled = false
            channels_settings_classic.isEnabled = false
            arrow_drop_down.isEnabled = false
            channelDropDown.isEnabled = false
            send_button_multiplayer.isEnabled = false

            val nextImageButton = view.findViewById<ImageButton>(R.id.next_button_multiplayer)
            val previousImageButton = view.findViewById<ImageButton>(R.id.previous_button_multiplayer)
            val exitTutorialButton = view.findViewById<ImageButton>(R.id.close_tutorial_button_multiplayers)
            val tutorialImageView = view.findViewById<ImageView>(R.id.tutorial_images_multiplayer)
            val tutorialTextView = view.findViewById<TextView>(R.id.text_description_multiplayer)

            tutorialImageView.setImageResource(arrayImagesClassicMode[0])
            tutorialTextView.text = listOfTextClassicMode[0]
            nextImageButton.visibility = View.VISIBLE
            previousImageButton.visibility = View.INVISIBLE
            indexClassicMode = 0

            nextImageButton.setOnClickListener {
                indexClassicMode++
                tutorialImageView.setImageResource(arrayImagesClassicMode[indexClassicMode])
                tutorialTextView.text = listOfTextClassicMode[indexClassicMode]
                previousImageButton.visibility = View.VISIBLE
                nextImageButton.visibility = View.VISIBLE

                // Si on arrive à la fin, on enlève la flèche de droite
                if (indexClassicMode == arrayImagesClassicMode.size - 1) {
                    nextImageButton.visibility = View.INVISIBLE
                    previousImageButton.visibility = View.VISIBLE
                }
            }

            previousImageButton.setOnClickListener {
                indexClassicMode--
                tutorialImageView.setImageResource(arrayImagesClassicMode[indexClassicMode])
                tutorialTextView.text = listOfTextClassicMode[indexClassicMode]
                previousImageButton.visibility = View.VISIBLE
                nextImageButton.visibility = View.VISIBLE

                if (indexClassicMode == 0){
                    tutorialImageView.setImageResource(arrayImagesClassicMode[0])
                    tutorialTextView.text = listOfTextClassicMode[0]
                    previousImageButton.visibility = View.INVISIBLE
                    nextImageButton.visibility = View.VISIBLE
                }

                if(indexClassicMode == arrayImagesClassicMode.size -1){
                    tutorialImageView.setImageResource(arrayImagesClassicMode[indexClassicMode])
                    tutorialTextView.text = listOfTextClassicMode[indexClassicMode]
                    previousImageButton.visibility = View.VISIBLE
                    nextImageButton.visibility = View.INVISIBLE
                }
            }

            exitTutorialButton.setOnClickListener {
                popupWindow.dismiss()

                indexClassicMode = 0
                tutorialImageView.setImageResource(arrayImagesClassicMode[0])
                tutorialTextView.text = listOfTextClassicMode[0]
                previousImageButton.visibility = View.INVISIBLE
                nextImageButton.visibility = View.VISIBLE
            }

            popupWindow.setOnDismissListener {
                message_eddittext_multiplayer.isEnabled = true
                tutorial_button.isEnabled = true
                music_button.isEnabled = true
                channels_settings_classic.isEnabled = true
                arrow_drop_down.isEnabled = true
                channelDropDown.isEnabled = true
                send_button_multiplayer.isEnabled = true

                indexClassicMode = 0
                tutorialImageView.setImageResource(arrayImagesClassicMode[0])
                tutorialTextView.text = listOfTextClassicMode[0]
                previousImageButton.visibility = View.INVISIBLE
                nextImageButton.visibility = View.VISIBLE
            }

            createPopUpWindowTransitions(popupWindow)
            popupWindow.softInputMode = WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE

            // Show the popup window on app
            TransitionManager.beginDelayedTransition(multiplayer_activity_layout)
            popupWindow.showAtLocation(
                    multiplayer_activity_layout,
                    Gravity.CENTER,
                    0,
                    0)
        }
    }

    private fun createPopUpWindowTransitions(popupWindow: PopupWindow){
        // Create a new slide animation for popup window enter transition
        val slideIn = Slide()
        slideIn.slideEdge = Gravity.TOP
        popupWindow.enterTransition = slideIn

        // Slide animation for popup window exit transition
        val slideOut = Slide()
        slideOut.slideEdge = Gravity.BOTTOM
        popupWindow.exitTransition = slideOut

        popupWindow.elevation = 10F
    }

}
