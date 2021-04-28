package com.example.polydessinmobile
import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.ColorMatrix
import android.graphics.ColorMatrixColorFilter
import android.graphics.drawable.ColorDrawable
import android.media.AudioManager
import android.media.Image
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
import com.github.kittinunf.fuel.Fuel
import com.github.kittinunf.fuel.core.extensions.jsonBody
import com.google.firebase.auth.ktx.auth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.firestore.ktx.toObject
import com.google.firebase.ktx.Firebase
import kotlinx.android.synthetic.main.activity_multiplayer_drawing.*
import kotlinx.android.synthetic.main.activity_sign_up.*
import kotlinx.android.synthetic.main.activity_sprint_solo.*
import kotlinx.android.synthetic.main.confirm_quit_channel.*
import kotlinx.android.synthetic.main.end_game_confirmation.*
import nl.dionsegijn.konfetti.models.Shape
import nl.dionsegijn.konfetti.models.Size
import java.text.SimpleDateFormat
import java.util.*


class SprintSoloActivity : CanvasSoloSprintActivity(), TextToSpeech.OnInitListener {

    // images array Sprint Solo
    private var arrayImagesSprintSolo = intArrayOf(
            R.drawable.c_game_view_good_guess_solo,
            R.drawable.d_game_view_bad_guess_solo,
            R.drawable.f_tutorial,
            R.drawable.e_game_over_solo
    )

    private var listOfTextSprintSolo = arrayOf(
        "Game view: On each good answer, the player wins points and time depending on the difficulty level. When the player guesses the good word, additional time will be added on the timer. The number of hints depends on the difficulty level. Accessing the hints does not take away any points.",
        "Game view: On each bad answer, the player loses an attempt. If no attempts are left, another drawing is shown. ",
        "Tutorial: If the player opens the tutorial, the time and the drawing are paused.",
        "Game over: The game finishes if the time runs out."
    )

    // Défilement d'images et de texte
    private var indexSprintSolo = 0

    // Text to speech
     var textToSpeech: TextToSpeech? = null

    // Chat
    lateinit var chatBox: TextView

    // music
    private lateinit var mediaPlayerMusicBackground: MediaPlayer
    private  lateinit var mediaPlayerMusicGameOver:MediaPlayer
    private  lateinit var mediaPlayerMusicGoodGuess:MediaPlayer
    private  lateinit var mediaPlayerMusicBadGuess:MediaPlayer
    private  lateinit var mediaPlayerMusicReceivedMessage:MediaPlayer
    private var musicOn = true
    private var robotVoiceOn = true

    // Game infos

    private val listPlayers = mutableListOf(PlayerGameItem(), PlayerGameItem())

    lateinit var gameId: String
    private val playerUsername = ServerRequest().getUsernameEmail()
    private var gameState = 0
    private lateinit var gameDifficulty: String
    private var currentImage = ""
    private var word = ""
    private var wordGuess = ""
    private var hints = arrayListOf<String>()
    private var hintsLeft : Int = 0
    private var attemptsLeft : Int = 0
    private var correctGuesses : Int = 0
    private var badGuesses : Int = 0
    private var chronometerValue: Long = 0
    private var shareKey = ""
    private var channelName = ""
    private var gameShareKey = ""
    private var isJoining = true
    private var isFirstNewPage = true
    private var isFirst = true
    private var imageID = ""

    @ExperimentalStdlibApi
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        showOrHideNotif()

        val logItent = Intent(this, MainActivity::class.java)
        ServerRequest().getIsLoggin(object : MyCallBackBool {
            override fun onCallBack(value: Boolean) {
                if (!value) ServerRequest().setIsLogginOn()
                else {
                    startActivity(logItent)
                    Firebase.auth.signOut()
                }
            }
        })

        gameId = intent.getStringExtra("gameId").toString()


        title = "Solo Sprint"

        //************************ Pop up **********************************
        // Initialize a new layout inflater instance of chat popup
        val inflater: LayoutInflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        tutorialPopUp(inflater)

        setMusic()
        setRobotVoice()

        val docRef = Firebase.firestore.collection("solo-games").document(gameId)
        var registration: ListenerRegistration? = null
        registration = docRef.addSnapshotListener { snapshot, e ->
            if (e != null) {
                return@addSnapshotListener
            }

            if (snapshot != null && snapshot.exists()) {


                val game = snapshot.toObject<GameSolo>()!!

                imageID = game.currentImageId

                if (game.state == 4) { // Game finie
                    gameState = 4
                    showEndPopup()
                    registration?.remove()
                }
                else if (gameState == 0) { // Début de game
                    gameDifficulty = game.difficulty
                    difficulty_value.text = gameDifficulty

                    listPlayers[0].playerRole = "Drawing"
                    listPlayers[0].playerUsername = "Alice [Robot]"
                    listPlayers[0].playerAvatar = "robot_team_a"

                    listPlayers[1].playerRole = "Guessing"
                    listPlayers[1].playerUsername = playerUsername
                    ServerRequest().getAvatar(object : MyCallBackString {
                        override fun onCallBack(value: String) {
                            listPlayers[1].playerAvatar = value
                            if(listPlayers[1].playerBadge1 != "") { // Badges remplis
                                createPlayersList()
                            }
                        }
                    })
                    ServerRequest().getSelectedBadges(object : MyCallBackStringArray{
                        override fun onCallBack(value: ArrayList<String>) {
                            listPlayers[1].playerBadge1 = value[0]
                            listPlayers[1].playerBadge2 = value[1]
                            listPlayers[1].playerBadge3 = value[2]
                            if(listPlayers[1].playerAvatar != "") { // Avatar rempli
                                createPlayersList()
                            }
                        }
                    }, playerUsername)
                }
                if (gameState == 1) drawImageRobot(game.currentImageId, game.difficulty)

                if(game.currentImageId != currentImage) { // Nouveau mot
                    listPlayers[1].playerScore = game.score
                    hints_shared_solo.text = ""
                    currentImage = game.currentImageId
                    setAttemptsLeft()

                    ServerRequest().getWord(object : MyCallBackString {
                        override fun onCallBack(value: String) {
                            word = value
                            setPlayerView()
                        }
                    }, game.currentImageId)

                    ServerRequest().getHints(object : MyCallBackStringArray {
                        override fun onCallBack(value: ArrayList<String>) {
                            hints = value
                            hintsLeft = hints.size
                            setPlayerView()
                        }
                    }, game.currentImageId)
                }
                createPlayersList()
                if(gameState == 0){
                    chronometer_solo.setOnChronometerTickListener {
                        if(chronometer_solo.text == "00:00" && gameState == 0) {
                            gameState = 1
                            setPlayerView()
                            chronometerValue = getInitialChronoValue()
                            chronometer_solo.base = SystemClock.elapsedRealtime() + chronometerValue
                            chronometer_solo.setOnChronometerTickListener {
                                if(chronometer_solo.text == "00:00") {
                                    reset()
                                    chronometer_solo.stop()
                                    Fuel.post("https://us-central1-chat-b68d4.cloudfunctions.net/endSoloGame")
                                            .jsonBody("{ \"gameId\" : \"$gameId\", \"badAttemptsThisRound\" : \"$badGuesses\" }")
                                            .responseString { _, _, result ->
                                                Log.d("DocSnippets", result.get())
                                            }
                                }

                            }
                            if (isFirst) {
                                drawImageRobot(imageID, game.difficulty)
                                isFirst = false
                            }
                        }
                    }
                }

            }

        }

        chronometer_solo.isCountDown = true
        chronometerValue = 5000
        chronometer_solo.base = SystemClock.elapsedRealtime() + chronometerValue
        chronometer_solo.start()

        chat() // À modifier

        ServerRequest().getChannelWithId(object : MyCallBackChannelServer {
            override fun onCallBack(value: ChannelServer) {
                gameShareKey = value.key
                shareKey = value.key
                ServerRequest().setChannelsUsers(shareKey)
                channelName = value.name
                setChannelsDropDown(findViewById<View>(android.R.id.content).rootView)
                ServerRequest().listenHintsRobotsMessage(object : MyCallBackMessage {
                    override fun onCallBack(value: Message) {
                        if(robotVoiceOn) speakOut(value.content)
                    }
                }, gameShareKey)
            }
        }, gameId)

        setSeeMore()
        setChannelParameter()

        setGeneralButtonsOnClickListeners()

        mediaPlayerMusicReceivedMessage = MediaPlayer.create(this, R.raw.receive_message)

        ServerRequest().listenToNewMessage(object : MyCallBackInt {
            override fun onCallBack(value: Int) {
                if(value != 0 && !isFirstNewPage) mediaPlayerMusicReceivedMessage.start()
                isFirstNewPage = false
            }
        }, object : MyCallBackString {
            override fun onCallBack(value: String) {
                isViewChannel[value] = value == shareKey
                showOrHideNotif()
            }
        })
    }

    private fun showOrHideNotif() {
        var showNotif = false
        for (i in isViewChannel) if (!i.value) showNotif = true
        if (showNotif) showNotification()
        else hideNotification()
    }

    override fun onRestart() {
        super.onRestart()
        resumeDrawing()
        chronometer_solo.base = SystemClock.elapsedRealtime() + chronometerValue
        chronometer_solo.start()
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


    private fun setSeeMore() {
        see_more_solo.setOnClickListener {
            isShowingAllMessages = true
            ServerRequest().getMessages(object : MyCallBackMessageList {
                override fun onCallBack(value: MutableList<Message>) {
                    showAllMessageChannel(value)
                }
            }, shareKey)
        }
    }

    private fun setChannelParameter() {
        channels_settings_solo.setOnClickListener {
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
            TransitionManager.beginDelayedTransition(sprint_solo_activity_layout)
            popupWindow.showAtLocation(
                    sprint_solo_activity_layout,
                    Gravity.CENTER,
                    0,
                    0)
        }
    }

    private fun setQuitChannelButton(view: View){
        val quitChannelButton = view.findViewById<Button>(R.id.quit_channel_button_game_popup)
        if(shareKey == "ABCDEF" || shareKey == gameShareKey){
            quitChannelButton.setBackgroundResource(R.drawable.quit_button_disabled)
        }
        else quitChannelButton.setBackgroundResource(R.drawable.quit_button_enabled)
        // TODO : Changer le channel actif pour le general channel
        quitChannelButton.setOnClickListener {
            if (shareKey == gameShareKey) showMessage("Can't quit the game Channel")
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

        // TODO : Déterminer si on est le host ou non
        if(false){
            dialogs.quit_confirmation_message.text = dialogs.quit_confirmation_message.text.toString() + " Since you are the host, the channel will be deleted."
        }

        dialogs.ok_quit_channel_confirmation_button.setOnClickListener {
            ServerRequest().quitChannel(shareKey)
            shareKey = gameShareKey
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
                // TODO : Vérifier si le nom du channel existe
                // TODO : Ajouter le joueur au channel

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
                // TODO : Vérifier si le nom du channel n'existe pas déjà
                // TODO : Créer le channel

                // TODO : Ajouter le joueur au channel

                val channelDropDown = view.findViewById<Spinner>(R.id.channel_drop_down_popup)
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

    @ExperimentalStdlibApi
    private fun setPlayerView(){
        when(gameState){
            0 -> { // Before game
                word_to_guess_solo.text = "Get ready..."
                setNotGuessingTools()
            }
            1 -> {
                word_to_guess_solo.text = "Word to guess : " + wordInUnderscore(word)
                setGuessingTools()
            }
            2 -> { // Correct guess
                word_to_guess_solo.text =
                    "Yay! You guessed correctly! Get ready for the next word..."
                setNotGuessingTools()
            }
            3 -> { // No more attempts
                word_to_guess_solo.text =
                    "No more attempts for this word. Get ready for the next one..."
                setNotGuessingTools()
            }
            4 -> { // Game end
                word_to_guess_solo.text = "Game over"
                setNotGuessingTools()
            }
        }
    }

    private fun setAttemptsLeft(){
        if(gameDifficulty == "easy") attemptsLeft = 3
        else if (gameDifficulty == "normal") attemptsLeft = 2
        else attemptsLeft = 1
        attempts_left_value.text = attemptsLeft.toString()
    }

    private fun getInitialChronoValue(): Long {
        if(gameDifficulty == "easy") return 45000L
        else if (gameDifficulty == "normal") return 35000L
        else return 30000L
    }

    private fun getAdditionalChronoValue(): Long {
        if(gameDifficulty == "easy") return 40000L
        else if (gameDifficulty == "normal") return 30000L
        else return 20000L
    }

    // PLAYERS
    private fun createPlayersList(){
        recycler_view_players_solo.adapter = PlayerCardAdapter(listPlayers) // Prend en paramètre un MutableList<PlayerGameItem>
        recycler_view_players_solo.layoutManager = LinearLayoutManager(this)
        recycler_view_players_solo.setHasFixedSize(true)
    }

    // Appeler quand la PARTIE est terminée (ramène au menu principal)
    private fun showEndPopup() {
        viewKonfetti.build()
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
                .setPosition(-50f, viewKonfetti.width + 50f, -50f, -50f)
                .streamFor(800, 4000L)

        createMusicEndGame()

        val inflater: LayoutInflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        val view = inflater.inflate(R.layout.end_game_solo, null)

        val popupWindow = PopupWindow(
            view,
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT,
            false
        )

        val okButton = view.findViewById<Button>(R.id.ok_end_game_solo_button)
        okButton.setOnClickListener{
            ServerRequest().quitChannel(gameShareKey)
            mediaPlayerMusicBackground.pause()
            mediaPlayerMusicGameOver.pause()
            popupWindow.dismiss()
            finish()
            startActivity(Intent(this, MainMenuActivity::class.java))
        }

        val gameResult = view.findViewById<TextView>(R.id.game_result_solo)
        gameResult.text = "Final score : " + listPlayers[1].playerScore + " points\nWords guessed : " + correctGuesses
        val playerAvatar = view.findViewById<ImageView>(R.id.avatar_end_solo)
        setImageDrawableWithName(listPlayers[1].playerAvatar, playerAvatar)

        popupWindow.isOutsideTouchable = false
        popupWindow.elevation = 10F
        window.setFlags(
            WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE,
            WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE
        )

        // Finally, show the popup window on app
        TransitionManager.beginDelayedTransition(sprint_solo_activity_layout)
        popupWindow.showAtLocation(
            sprint_solo_activity_layout, // Location to display popup window
            Gravity.CENTER, // Exact position of layout to display popup
            0, // X offset
            0 // Y offset
        )
    }

    override fun onBackPressed() { // Back button dans la barre noire en bas
        confirmationExitDialog()
    }

    private fun confirmationExitDialog(){
        val dialogs = Dialog(this)
        dialogs.requestWindowFeature(Window.FEATURE_NO_TITLE)
        dialogs.setContentView(R.layout.end_game_confirmation)

        dialogs.end_confirmation_message.text = "Are you sure you want to quit the game? Your final score will be as it is."

        dialogs.ok_end_game_confirmation_button.setOnClickListener {
            reset()
            ServerRequest().quitChannel(gameShareKey)
            chronometer_solo.stop()
            Fuel.post("https://us-central1-chat-b68d4.cloudfunctions.net/endSoloGame")
                .jsonBody("{ \"gameId\" : \"$gameId\", \"badAttemptsThisRound\" : \"$badGuesses\" }")
                .responseString { _, _, result ->
                    Log.d("DocSnippets", result.get())
                }
            dialogs.dismiss()
        }
        dialogs.cancel_end_game_confirmation_button.setOnClickListener {
            dialogs.dismiss()
        }
        dialogs.show()
    }

    private fun guessWord(){
        if(wordGuess.isNotBlank() && shareKey == gameShareKey){
            if(wordGuess.toLowerCase() == word.toLowerCase()){
                reset()
                chronometer_solo.base += getAdditionalChronoValue()
                ServerRequest().addMessageSystem("Good guess! The word was $word", FieldValue.serverTimestamp(), gameShareKey, "System")
                correctGuesses += 1
                correct_guesses_value.text = correctGuesses.toString()
                Fuel.post("https://us-central1-chat-b68d4.cloudfunctions.net/correctSoloGuess")
                    .jsonBody("{ \"gameId\" : \"$gameId\", \"correctAttemptsThisRound\" : \"1\", \"badAttemptsThisRound\" : \"$badGuesses\" }")
                    .responseString { _, _, result ->
                        Log.d("DocSnippets", result.get())
                    }
                badGuesses = 0
                word = ""
                hints = arrayListOf()
            }
            else {
                attemptsLeft -= 1
                badGuesses += 1
                attempts_left_value.text = attemptsLeft.toString()
                if(attemptsLeft == 0) {
                    ServerRequest().addMessageSystem("No attempt left! The word was $word", FieldValue.serverTimestamp(), gameShareKey, "System")
                    reset()
                    Fuel.post("https://us-central1-chat-b68d4.cloudfunctions.net/noMoreSoloAttempts")
                        .jsonBody("{ \"gameId\" : \"$gameId\", \"badAttemptsThisRound\" : \"$badGuesses\" }")
                        .responseString { _, _, result ->
                            Log.d("DocSnippets", result.get())
                        }
                    badGuesses = 0
                }
                else ServerRequest().addMessageSystem("Wrong guess! $attemptsLeft attempt(s) left...", FieldValue.serverTimestamp(), gameShareKey, "System")
            }
            wordGuess = ""
        }
    }

    // CHANNELS
    private fun setChannelsDropDown(views: View){

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
                        else views.findViewById<Spinner>(R.id.channels_dropdown_solo)

                        // set selected item style
                        if (position == channelDropDown.selectedItemPosition) {
                            view.background = ColorDrawable(ContextCompat.getColor(context, R.color.colorPrimaryMedium))
                        }
                        return view
                    }
                }

                val channelDropDown = if(views != findViewById<View>(android.R.id.content).rootView)views.findViewById<Spinner>(R.id.channel_drop_down_game_popup)
                else views.findViewById<Spinner>(R.id.channels_dropdown_solo)

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
        mediaPlayerMusicBackground =  MediaPlayer.create(this, R.raw.ride_music)
        mediaPlayerMusicBackground.isLooping = true
        mediaPlayerMusicBackground.setVolume(0.4F, 0.4F)

        // Afficher le paramètre de musique
        ServerRequest().getMusicOn(object : MyCallBackBool{
            override fun onCallBack(value: Boolean) {
                musicOn = value
                if(musicOn) {
                    mediaPlayerMusicBackground.start()
                    music_button_solo.setImageResource(R.drawable.ic_music)
                    music_button_solo.setPadding(15, 15, 18, 15)
                }
                else{
                    music_button_solo.setImageResource(R.drawable.ic_music_off)
                    music_button_solo.setPadding(15, 15, 5, 15)
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
                    robot_voice_button_solo.setImageResource(R.drawable.ic_robot_voice_on)
                    robot_voice_button_solo.setPadding(17, 12, 12, 14)
                } else {
                    robot_voice_button_solo.setImageResource(R.drawable.ic_robot_voice_off)
                    robot_voice_button_solo.setPadding(8, 8, 8, 8)
                }
            }
        })
    }

    private fun sendMessage(date: FieldValue, channel: String, editTextBox: EditText) {
        wordGuess = editTextBox.text.toString()
        if(wordGuess.isNotBlank()) {
            ServerRequest().addMessage(editTextBox.text.toString(), date, channel)
            if(gameState == 1 && channel == gameShareKey) {
                guessWord()
                if (wordGuess.toLowerCase() == word.toLowerCase()) mediaPlayerMusicGoodGuess.start()
                else mediaPlayerMusicBadGuess.start()
            }
        }
        editTextBox.text.clear()
    }

    // CHAT
    @ExperimentalStdlibApi
    private fun chat() {

        enter_message_solo.setOnKeyListener(View.OnKeyListener { _, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_UP) {
                sendMessage(FieldValue.serverTimestamp(), shareKey, enter_message_solo)
                if(wordGuess.isNotBlank())
                if (gameState == 1) {
                    guessWord()
                }
                return@OnKeyListener true
            }
            false
        })

        send_button_solo.setOnClickListener {
            sendMessage(FieldValue.serverTimestamp(), shareKey, enter_message_solo)

        }

        chatBox = findViewById(R.id.chat_messages_solo)
        chatBox.movementMethod = ScrollingMovementMethod()
    }

    private fun textBoxShowChat(message: String) {
        val newTextBox = chatBox.text.toString() + "\n" + message
        chatBox.setText(newTextBox).toString()
    }

    // GUESSER

    private fun setGuessingTools(){
        send_button_solo.text = "Guess"
        enter_message_solo.hint = "Enter your guess"
        ask_hint_button_solo.visibility = View.VISIBLE
        ask_hints_left_solo.visibility = View.VISIBLE
        setHintButton(ask_hint_button_solo, ask_hints_left_solo)
    }

    private fun setNotGuessingTools(){
        send_button_solo.text = "Send"
        enter_message_solo.hint = "Enter your message"
        ask_hint_button_solo.visibility = View.INVISIBLE
        ask_hints_left_solo.visibility = View.INVISIBLE
    }

    // HINTS

    private fun setHintButton(hintButton: ImageButton, nbHintsLeft: TextView){
        nbHintsLeft.text = hintsLeft.toString()
        if(hintsLeft != 0) {
            setEnabled(hintButton)
            hintButton.setOnClickListener {
                sendHint()
                updateViewHints()
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
        ServerRequest().addMessageSystem("The hint you asked for is : $newHint", FieldValue.serverTimestamp(), gameShareKey, "Hint")
    }

    private fun updateViewHints(){
        if(hintsLeft != 0){
            var hint = hints[hints.size - hintsLeft]
            hint = if (hintsLeft == hints.size){ // Si c'est le premier hint qu'on donne
                hints_shared_solo.setBackgroundResource(R.color.white)
                "Hints : $hint"
            } else {
                ", $hint"
            }
            hints_shared_solo.text = hints_shared_solo.text.toString() + hint

            hintsLeft -= 1
            setHintButton(ask_hint_button_solo, ask_hints_left_solo)
        }
    }

    private fun setGeneralButtonsOnClickListeners(){
        robot_voice_button_solo.setOnClickListener { view->
            robotVoiceOn = !robotVoiceOn
            if (robotVoiceOn) {
                robot_voice_button_solo.setImageResource(R.drawable.ic_robot_voice_on)
                robot_voice_button_solo.setPadding(17, 12, 12, 14)
            } else {
                robot_voice_button_solo.setImageResource(R.drawable.ic_robot_voice_off)
                robot_voice_button_solo.setPadding(8, 8, 8, 8)
            }
        }

        music_button_solo.setOnClickListener {
            musicOn = !musicOn
            if(musicOn){
                music_button_solo.setImageResource(R.drawable.ic_music)
                music_button_solo.setPadding(15, 15, 18, 15)
                mediaPlayerMusicBackground.start()
            }
            else{
                music_button_solo.setImageResource(R.drawable.ic_music_off)
                music_button_solo.setPadding(15, 15, 5, 15)
                mediaPlayerMusicBackground.pause()
            }
        }


        //************************ Pop up **********************************
        // Initialize a new layout inflater instance of chat popup
        val inflater: LayoutInflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        tutorialPopUp(inflater)

        mediaPlayerMusicGoodGuess = MediaPlayer.create(this, R.raw.good_guess)
        mediaPlayerMusicBadGuess = MediaPlayer.create(this, R.raw.bad_guess)
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

    private fun setImageDrawableWithName(drawableName: String, imageView: ImageView){
        val context: Context = imageView.context
        val id: Int = context.resources.getIdentifier(drawableName, "drawable", context.packageName)
        imageView.setImageResource(id)
    }

    //************************ Music ***********************************
    private fun createMusicEndGame(){
        mediaPlayerMusicBackground.pause()
        mediaPlayerMusicGameOver =  MediaPlayer.create(this, R.raw.uplifting_music)
        mediaPlayerMusicGameOver.isLooping = true
        if(musicOn) mediaPlayerMusicGameOver.start()
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean { // Back button dans la action bar en haut
        when (item.itemId) {
            android.R.id.home -> confirmationExitDialog()
        }
        return true
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
        chronometerValue = chronometer_solo.base - SystemClock.elapsedRealtime();
        chronometer_solo.stop()
        pauseDrawing()
        ServerRequest().setIsLogginOff()
    }

    private fun showNotification(){
        notification_popup_solo.visibility = View.VISIBLE
    }

    private fun hideNotification(){
        notification_popup_solo.visibility = View.GONE
    }

    // *************************** Tutorial Pop Up ***********************************************
    private fun tutorialPopUp(inflater: LayoutInflater) {
        tutorial_button_solo.setOnClickListener {
            chronometerValue = chronometer_solo.base - SystemClock.elapsedRealtime();
            chronometer_solo.stop()
            pauseDrawing()

            // Inflate a custom view using layout inflater
            val view = inflater.inflate(R.layout.tutorial_solo_sprint, null)

            // Initialize a new instance of popup window
            val popupWindow = PopupWindow(view, ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, true)

            val nextImageButton = view.findViewById<ImageButton>(R.id.next_button_lobby_solo_sprint)
            val previousImageButton = view.findViewById<ImageButton>(R.id.previous_button_solo_sprint)
            val tutorialImageView = view.findViewById<ImageView>(R.id.tutorial_images_solo_sprint)
            val tutorialTextView = view.findViewById<TextView>(R.id.text_description_solo_sprint)
            val exitTutorialButton = view.findViewById<ImageButton>(R.id.close_tutorial_solo_sprint)

            tutorialImageView.setImageResource(arrayImagesSprintSolo[0])
            tutorialTextView.text = listOfTextSprintSolo[0]
            previousImageButton.visibility = View.INVISIBLE
            nextImageButton.visibility = View.VISIBLE
            indexSprintSolo = 0

            nextImageButton.setOnClickListener {
                indexSprintSolo++
                tutorialImageView.setImageResource(arrayImagesSprintSolo[indexSprintSolo])
                tutorialTextView.text = listOfTextSprintSolo[indexSprintSolo]
                previousImageButton.visibility = View.VISIBLE
                nextImageButton.visibility = View.VISIBLE

                // Si on arrive à la fin, on enlève la flèche de droite
                if (indexSprintSolo == arrayImagesSprintSolo.size - 1) {
                    nextImageButton.visibility = View.INVISIBLE
                    previousImageButton.visibility = View.VISIBLE
                }
            }

            previousImageButton.setOnClickListener {
                indexSprintSolo--
                tutorialImageView.setImageResource(arrayImagesSprintSolo[indexSprintSolo])
                tutorialTextView.text = listOfTextSprintSolo[indexSprintSolo]
                previousImageButton.visibility = View.VISIBLE
                nextImageButton.visibility = View.VISIBLE

                if (indexSprintSolo == 0){
                    tutorialImageView.setImageResource(arrayImagesSprintSolo[0])
                    tutorialTextView.text = listOfTextSprintSolo[0]
                    previousImageButton.visibility = View.INVISIBLE
                    nextImageButton.visibility = View.VISIBLE
                }

                if(indexSprintSolo == arrayImagesSprintSolo.size -1){
                    tutorialImageView.setImageResource(arrayImagesSprintSolo[indexSprintSolo])
                    tutorialTextView.text = listOfTextSprintSolo[indexSprintSolo]
                    previousImageButton.visibility = View.VISIBLE
                    nextImageButton.visibility = View.INVISIBLE
                }
            }


            exitTutorialButton.setOnClickListener {
                popupWindow.dismiss()
                chronometer_solo.base = SystemClock.elapsedRealtime() + chronometerValue
                chronometer_solo.start()
                resumeDrawing()
                indexSprintSolo = 0
                tutorialImageView.setImageResource(arrayImagesSprintSolo[0])
                tutorialTextView.text = listOfTextSprintSolo[0]
                previousImageButton.visibility = View.INVISIBLE
                nextImageButton.visibility = View.VISIBLE
            }

            popupWindow.setOnDismissListener {
                chronometer_solo.base = SystemClock.elapsedRealtime() + chronometerValue
                chronometer_solo.start()
                resumeDrawing()

                indexSprintSolo = 0
                tutorialImageView.setImageResource(arrayImagesSprintSolo[0])
                tutorialTextView.text = listOfTextSprintSolo[0]
                previousImageButton.visibility = View.INVISIBLE
                nextImageButton.visibility = View.VISIBLE
            }

            createPopUpWindowTransitions(popupWindow)
            popupWindow.softInputMode = WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE

            // Show the popup window on app
            TransitionManager.beginDelayedTransition(sprint_solo_activity_layout)
            popupWindow.showAtLocation(
                sprint_solo_activity_layout,
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
