package com.example.polydessinmobile

import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.graphics.drawable.ColorDrawable
import android.media.MediaPlayer
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.text.method.ScrollingMovementMethod
import android.transition.Slide
import android.transition.TransitionManager
import android.util.Log
import android.util.TypedValue
import android.view.*
import android.widget.*
import androidx.core.content.ContextCompat
import androidx.core.view.setPadding
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
import kotlinx.android.synthetic.main.activity_user_profile.*
import kotlinx.android.synthetic.main.confirm_quit_channel.*
import kotlinx.android.synthetic.main.end_game_confirmation.*
import kotlinx.android.synthetic.main.host_quit_lobby.*
import kotlinx.android.synthetic.main.quit_lobby_confirmation.*
import java.text.SimpleDateFormat
import java.util.*

class LobbyActivity : AppCompatActivity() {

    // images array Classic Mode
    private var arrayImagesClassicMode = intArrayOf(
            R.drawable.g_lobby_joiner_view,
            R.drawable.h_drawer_tools,
            R.drawable.i_guess_word,
            R.drawable.k_whos_drawing,
            R.drawable.j_game_over
    )

    private var listOfTextClassicMode = arrayOf(
        "Lobby - Joiner's view: The player can mute the music, open the tutorial or quit the game.",
        "Game view: While drawing, the player has acces on a variety of tools for drawing such as the pencil, the eraser and the grid. You can also change the opacity of the tools.",
        "Game view: While guessing, the player can guess the word and can get a maximum of 3 hints. Accessing the hints does not take away any points.",
        "Game view: On the left side, the player can see who's turn it is.",
        "Game over: When the game is over, you can go back to the main menu."
    )

    private var indexClassicMode = 0

    private lateinit var gameName: String
    private var isPublic = true
    private var isJoining = true
    private var musicOn = true
    private lateinit var gameKey: String
    private val gameType = "Classic" // Unique mode de jeu possible
    private lateinit var gameDifficulty: String
    private lateinit var lobbyId: String
    private lateinit var gameHost: String
    private lateinit var gameMode: String
    private var playerUsername = ServerRequest().getUsernameEmail()
    private val listPlayers = mutableListOf(PlayerGameItem(), PlayerGameItem(), PlayerGameItem(), PlayerGameItem())
    private var registration: ListenerRegistration? = null
    private var shareKey = ""
    private var lobbyName = ""
    lateinit var chatBox: TextView
    private var isFirst = true
    private var isFirstNewPage = true



    private lateinit var mediaPlayerMusic: MediaPlayer
    private lateinit var mediaPlayerMusicReceiveMessage: MediaPlayer

    enum class Team {
        A, B
    }

    @ExperimentalStdlibApi
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_lobby)

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


        //************************ Pop up **********************************
        // Initialize a new layout inflater instance of chat popup
        val inflater: LayoutInflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        tutorialPopUp(inflater)

        title = "Game Lobby"

        setMusic()
        chatBox = findViewById(R.id.chat_messages_lobby)
        chatBox.movementMethod = ScrollingMovementMethod()

        lobbyId = intent.getStringExtra("lobbyId").toString()

        val docRef = Firebase.firestore.collection("lobbies").document(lobbyId)

        registration = docRef.addSnapshotListener { snapshot, e ->
            if (e != null) {
                Log.w("DocSnippets", "Listen failed.", e)
                return@addSnapshotListener
            }

            if (snapshot != null && snapshot.exists()) {

                val lobby = snapshot.toObject<Lobby>()!!

                ServerRequest().setChannelsUsers(lobby.shareKey)

                if (isFirst) shareKey = lobby.shareKey
                lobbyName = lobby.name
                activeGameShareKey = lobby.shareKey
                activeGameName = lobby.name

                if(lobby.gameId != ""){
                    val intent = Intent(this, MultiplayerDrawingActivity::class.java)
                    intent.putExtra("gameId", lobby.gameId)
                    startActivity(intent)
                    finish()
                    mediaPlayerMusic.pause()
                    registration?.remove()
                }

                gameHost = lobby.host
                if(gameHost == "") {
                    val dialogs = Dialog(this)
                    dialogs.requestWindowFeature(Window.FEATURE_NO_TITLE)
                    dialogs.setContentView(R.layout.host_quit_lobby)
                    dialogs.ok_host_quit_button.setOnClickListener {
                        startActivity(Intent(this, MainMenuActivity::class.java))
                        finish()
                        mediaPlayerMusic.pause()
                        registration?.remove()
                        dialogs.dismiss()
                    }
                    dialogs.show()
                    dialogs.setOnDismissListener {
                        startActivity(Intent(this, MainMenuActivity::class.java))
                        finish()
                        mediaPlayerMusic.pause()
                        registration?.remove()
                        dialogs.dismiss()
                    }

                }
                gameName = lobby.name
                isPublic = lobby.isPublic!!
                gameDifficulty = lobby.difficulty
                gameMode = lobby.mode
                gameKey = lobby.shareKey

                if (isFirst) setChannelsDropDown(findViewById<View>(android.R.id.content).rootView)
                isFirst = false

                setGameValues()

                for(player in listPlayers){
                    if(!lobby.players.containsKey(player.playerUsername)){
                        listPlayers[listPlayers.indexOf(player)] = PlayerGameItem()
                    }
                }

                for(player in lobby.players.keys){
                    listPlayers[lobby.players[player] ?: error("")].playerUsername = player

                    ServerRequest().getAvatarUser(object : MyCallBackString{
                        override fun onCallBack(value: String) {
                            listPlayers[lobby.players[player] ?: error("")].playerAvatar = value
                            setPlayersValues()
                            // Si le joueur est nous, on set la vue selon notre rôle (host ou non)
                            if(player == ServerRequest().getUsernameEmail() && player == gameHost){
                                setVirtualPlayersButtons()
                            }
                        }
                    }, player)
                    if(!player.contains("[Robot]")){
                        ServerRequest().getSelectedBadges(object : MyCallBackStringArray{
                            override fun onCallBack(value: ArrayList<String>) {
                                listPlayers[lobby.players[player] ?: error("")].playerBadge1 = value[0]
                                listPlayers[lobby.players[player] ?: error("")].playerBadge2 = value[1]
                                listPlayers[lobby.players[player] ?: error("")].playerBadge3 = value[2]
                                setPlayersValues()
                            }
                        }, player)
                    }
                }

                setStartOnClickListener()

            } else {
                Log.d("DocSnippets", "Current data: null")
            }
        }

        setSeeMoreButton()
        setChannelsSettings()
        setMusicButton()

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
    }

    private fun showOrHideNotif() {
        var showNotif = false
        for (i in isViewChannel) if (!i.value) showNotif = true
        if (showNotif) showNotification()
        else hideNotification()
    }

    override fun onPause() {
        super.onPause()
        ServerRequest().setLoginHistory()
        mediaPlayerMusic.pause()
        ServerRequest().setIsLogginOff()
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

    override fun onDestroy() {
        super.onDestroy()
        ServerRequest().destroyNotificationListener()
    }

    override fun onBackPressed() { // Back button dans la barre noire en bas
        confirmationExitDialog()
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean { // Back button dans la action bar en haut
        when (item.itemId) {
            android.R.id.home -> confirmationExitDialog()
        }
        return true
    }

    private fun setSeeMoreButton() {
        see_more_lobby.setOnClickListener {
            isShowingAllMessages = true
            ServerRequest().getMessages(object : MyCallBackMessageList {
                override fun onCallBack(value: MutableList<Message>) {
                    showAllMessageChannel(value)
                }
            }, shareKey)
        }
    }

    private fun confirmationExitDialog(){
        val dialogs = Dialog(this)
        dialogs.requestWindowFeature(Window.FEATURE_NO_TITLE)
        dialogs.setContentView(R.layout.quit_lobby_confirmation)

        dialogs.ok_quit_lobby_button.setOnClickListener {
            registration?.remove()
            ServerRequest().quitChannel(activeGameShareKey)
            if(gameHost == ServerRequest().getUsernameEmail()) ServerRequest().removeHost(lobbyId)
            else ServerRequest().removeLobbyPlayer(lobbyId, ServerRequest().getUsernameEmail())
            startActivity(Intent(this, MainMenuActivity::class.java))
            mediaPlayerMusic.pause()
            finish()
        }
        dialogs.cancel_quit_lobby_button.setOnClickListener {
            dialogs.dismiss()
        }
        dialogs.show()
    }

    private fun setGameValues() {
        if (isPublic) {
            game_privacy_value.text = "Public"
        }
        else {
            game_privacy_value.text = "Private"
        }
        game_id_value.text = gameKey
        game_difficulty_lobby_value.text = gameDifficulty
        game_name_lobby_value.text = gameName
        game_mode_lobby_value.text = gameType
    }

    private fun setMusic(){
        mediaPlayerMusic =  MediaPlayer.create(this, R.raw.challenging_music)
        mediaPlayerMusic.isLooping = true
        ServerRequest().getMusicOn(object : MyCallBackBool{
            override fun onCallBack(value: Boolean) {
                musicOn = value
                if(musicOn){
                    music_button_lobby.setImageResource(R.drawable.ic_music)
                    music_button_lobby.setPadding(15, 15, 17, 15)
                    mediaPlayerMusic.start()
                }
                else{
                    music_button_lobby.setImageResource(R.drawable.ic_music_off)
                    music_button_lobby.setPadding(15, 15, 8, 15)
                }
            }
        })
    }

    private fun setPlayersValues(){
        if(listPlayers[0].playerUsername != ""){
            player2_username.text = listPlayers[0].playerUsername
            setImageDrawableWithName(listPlayers[0].playerAvatar, player2_avatar)

            if(listPlayers[0].playerUsername.contains("[Robot]")){
                player2_badge1.setImageResource(0)
                player2_badge2.setImageResource(0)
                player2_badge3.setImageResource(0)
            }
            else {
                setImageDrawableWithName("ic_" +
                        listPlayers[0].playerBadge1, player2_badge1)
                setImageDrawableWithName("ic_" + listPlayers[0].playerBadge2, player2_badge2)
                setImageDrawableWithName("ic_" + listPlayers[0].playerBadge3, player2_badge3)
            }
        }
        else clearPlayerFields(player2_username, player2_avatar, player2_badge1, player2_badge2, player2_badge3)

        if(listPlayers[1].playerUsername != ""){
            player4_username.text = listPlayers[1].playerUsername
            setImageDrawableWithName(listPlayers[1].playerAvatar, player4_avatar)

            if(listPlayers[1].playerUsername.contains("[Robot]")){
                player4_badge1.setImageResource(0)
                player4_badge2.setImageResource(0)
                player4_badge3.setImageResource(0)
            }
            else {
                setImageDrawableWithName("ic_" + listPlayers[1].playerBadge1, player4_badge1)
                setImageDrawableWithName("ic_" + listPlayers[1].playerBadge2, player4_badge2)
                setImageDrawableWithName("ic_" + listPlayers[1].playerBadge3, player4_badge3)
            }
        }
        else clearPlayerFields(player4_username, player4_avatar, player4_badge1, player4_badge2, player4_badge3)

        // Le player [2] est toujours présent (host)
        player1_username.text = listPlayers[2].playerUsername
        setImageDrawableWithName(listPlayers[2].playerAvatar, player1_avatar)
        setImageDrawableWithName("ic_" + listPlayers[2].playerBadge1, player1_badge1)
        setImageDrawableWithName("ic_" + listPlayers[2].playerBadge2, player1_badge2)
        setImageDrawableWithName("ic_" + listPlayers[2].playerBadge3, player1_badge3)

        if(listPlayers[3].playerUsername != "") {
            player3_username.text = listPlayers[3].playerUsername
            setImageDrawableWithName(listPlayers[3].playerAvatar, player3_avatar)
            setImageDrawableWithName("ic_" + listPlayers[3].playerBadge1, player3_badge1)
            setImageDrawableWithName("ic_" + listPlayers[3].playerBadge2, player3_badge2)
            setImageDrawableWithName("ic_" + listPlayers[3].playerBadge3, player3_badge3)
        }
        else clearPlayerFields(player3_username, player3_avatar, player3_badge1, player3_badge2, player3_badge3)
    }

    private fun setVirtualPlayersButtons(){
        if(listPlayers[0].playerUsername == ""){
            add_virtual_player2.visibility = View.VISIBLE
            remove_virtual_player2.visibility = View.GONE
            add_virtual_player2.setOnClickListener {
                addVirtualPlayer(Team.A)
            }
        }
        else if (listPlayers[0].playerUsername.contains("[Robot]")) {
            remove_virtual_player2.visibility = View.VISIBLE
            add_virtual_player2.visibility = View.GONE
            remove_virtual_player2.setOnClickListener {
                removeVirtualPlayer(Team.A)
                listPlayers[0] = PlayerGameItem()
            }
        }
        else {
            add_virtual_player2.visibility = View.GONE
            remove_virtual_player2.visibility = View.GONE
        }

        if(listPlayers[1].playerUsername == ""){
            add_virtual_player4.visibility = View.VISIBLE
            remove_virtual_player4.visibility = View.GONE
            add_virtual_player4.setOnClickListener {
                addVirtualPlayer(Team.B)
            }
        }
        else if (listPlayers[1].playerUsername.contains("[Robot]")) {
            remove_virtual_player4.visibility = View.VISIBLE
            add_virtual_player4.visibility = View.GONE
            remove_virtual_player4.setOnClickListener {
                removeVirtualPlayer(Team.B)
                listPlayers[1] = PlayerGameItem()
            }
        }
        else {
            add_virtual_player4.visibility = View.GONE
            remove_virtual_player4.visibility = View.GONE
        }
    }

    private fun addVirtualPlayer(team: Team){
        val newGameMode: String
        val newPlayer: String
        val index: Int
        if(team == Team.A){
            newPlayer = "Alice [Robot]"
            index = 0
            newGameMode = if(gameMode.contains("vPP")) "RPvPP"
            else "RPvRP"
        }
        else { // Team B
            newPlayer = "Bob [Robot]"
            index = 1
            newGameMode = if(gameMode.contains("PPv")) "PPvRP"
            else "RPvRP"
        }
        ServerRequest().setLobbyVirtualPlayer(lobbyId, newPlayer, index, newGameMode)
    }

    private fun removeVirtualPlayer(team: Team){
        val newGameMode: String
        val playerUsername: String
        if(team == Team.A){
            newGameMode = if(gameMode.contains("vRP")) "PPvPP"
            else "PPvRP"
            playerUsername = "Alice [Robot]"
        }
        else { // Team B
            newGameMode = if(gameMode.contains("RPv")) "PPvPP"
            else "RPvPP"
            playerUsername = "Bob [Robot]"
        }
        ServerRequest().removeLobbyVirtualPlayer(lobbyId, playerUsername, newGameMode)
    }

    private fun clearPlayerFields(username: TextView, avatar: ImageView, badge1: ImageView, badge2: ImageView, badge3: ImageView){
        username.text = "No player"
        avatar.setImageResource(R.drawable.empty_avatar)
        badge1.setImageResource(0)
        badge2.setImageResource(0)
        badge3.setImageResource(0)
    }

    private fun setStartOnClickListener(){
        var startEnabled = true
        for(player in listPlayers){
            if (player.playerUsername == "") startEnabled = false
        }
        if (gameHost != playerUsername) startEnabled = false
        if(startEnabled){
            start_game_button.setBackgroundResource(R.drawable.rounded_corners_button_yellow)
            start_game_button.setOnClickListener {
                Fuel.post("https://us-central1-chat-b68d4.cloudfunctions.net/createGameFromLobby")
                        .jsonBody("{ \"lobbyId\" : \"$lobbyId\" }")
                        .response { result -> Log.d("DocSnippets", result.toString()) }
                start_game_button.setOnClickListener {
                    showMessage("Please wait")
                }
            }
        }
        else{
            start_game_button.setOnClickListener {
                if(gameHost != playerUsername) showMessage("Only the host can start the game when all players are there!")
                else showMessage("You must be 4 players to start a game! Wait for more players or add virtual players")
            }
            start_game_button.setBackgroundResource(R.drawable.rounded_corners_button_pale_yellow_no_border)
        }
    }

    private fun setChannelsDropDown(view: View){

        ServerRequest().getChannels(object : MyCallBackChannelsServer{
            override fun onCallBack(value: MutableList<ChannelServer>) {
                var list = mutableListOf<String>()
                list.add(lobbyName + "  | Key :  " + shareKey)
                for (v in value) if (v.key != shareKey) list.add(v.name + "  | Key :  " + v.key)

                // initialize an array adapter for spinner
                val adapter:ArrayAdapter<String> = object: ArrayAdapter<String>(baseContext, R.layout.spinner_layout, list){
                    override fun getDropDownView(
                            position: Int,
                            convertView: View?,
                            parent: ViewGroup
                    ): View {
                        val viewSpinner:TextView = super.getDropDownView(position, convertView, parent) as TextView
                        // set items properties
                        viewSpinner.setTextSize(TypedValue.COMPLEX_UNIT_SP, 20F)
                        viewSpinner.setPadding(20)


                        // set selected item style
                        val channelDropDownPopup : Spinner = if(view != findViewById<View>(android.R.id.content).rootView) view.findViewById<Spinner>(R.id.channel_drop_down_game_popup)
                        else view.findViewById<Spinner>(R.id.channels_dropdown_lobby)

                        if (position == channelDropDownPopup.selectedItemPosition) {
                            viewSpinner.background = ColorDrawable(ContextCompat.getColor(context, R.color.colorPrimaryMedium))
                        }
                        return viewSpinner
                    }
                }

                // finally, data bind spinner with adapter
                //val channelDropDown = view.findViewById<Spinner>(R.id.channels_dropdown_lobby)
                val channelDropDown = if(view != findViewById<View>(android.R.id.content).rootView) view.findViewById<Spinner>(R.id.channel_drop_down_game_popup)
                else view.findViewById<Spinner>(R.id.channels_dropdown_lobby)

                channelDropDown.adapter = adapter

                for (v in value) if (channelDropDown.selectedItem.toString().contains(v.key)) {
                    shareKey = v.key
                    lobbyName = v.name
                }

                // set up initial selection
                channelDropDown.setSelection(0) // Pas utile pour l'instant

                channelDropDown.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
                    override fun onItemSelected(parent: AdapterView<*>?, view2: View?, position: Int, id: Long) {
                        for (v in value) if (parent?.getItemAtPosition(position).toString().contains(v.key)) shareKey = v.key
                        isViewChannel[shareKey] = true
                        showOrHideNotif()
                        if(view != findViewById<View>(android.R.id.content).rootView) setQuitChannelButton(view)
                        ServerRequest().destroyListenerMessages()
                        isShowingAllMessages = false
                        ServerRequest().getMessages(object : MyCallBackMessageList {
                            override fun onCallBack(value: MutableList<Message>) {
                                showAllMessageChannel(value)
                            }
                        }, shareKey)
                    }
                    override fun onNothingSelected(parent: AdapterView<*>?) {
                    }
                }
            }
        })
    }

    private fun showAllMessageChannel(messages: MutableList<Message>) {
        chatBox.text = ""
        for (v in messages) textBoxShowChat("[${SimpleDateFormat("HH:mm:ss").format(v.date)}] ${v.sender} : ${v.content}")
    }

    private fun textBoxShowChat(message: String) {
        val newTextBox = chatBox.text.toString() + "\n" + message
        chatBox.setText(newTextBox).toString()
    }

    private fun sendMessage(date: FieldValue, channel: String, editTextBox: EditText) {
        if(editTextBox.text.toString().isNotBlank()) ServerRequest().addMessage(editTextBox.text.toString(), date, channel)
        editTextBox.text.clear()
    }

    private fun setChannelsSettings(){
        send_button_lobby.setOnClickListener {
            sendMessage(FieldValue.serverTimestamp(), shareKey, message_edittext_lobby)
        }

        message_edittext_lobby.setOnKeyListener(View.OnKeyListener { _, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_UP) {
                sendMessage(FieldValue.serverTimestamp(), shareKey, message_edittext_lobby)
                return@OnKeyListener true
            }
            false
        })

        channels_settings_lobby.setOnClickListener {
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
            TransitionManager.beginDelayedTransition(activity_lobby)
            popupWindow.showAtLocation(
                    activity_lobby,
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

    private fun setQuitChannelButton(view: View){
        val quitChannelButton = view.findViewById<Button>(R.id.quit_channel_button_game_popup)
        if(shareKey == "ABCDEF" || shareKey == gameKey){
            quitChannelButton.setBackgroundResource(R.drawable.quit_button_disabled)
        }
        else quitChannelButton.setBackgroundResource(R.drawable.quit_button_enabled)

        quitChannelButton.setOnClickListener {
            if (shareKey == gameKey) showMessage("Can't quit the game Channel")
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
        ServerRequest().getIfHostChannel(object : MyCallBackBool {
            override fun onCallBack(value: Boolean) {
                if (value) dialogs.quit_confirmation_message.text = dialogs.quit_confirmation_message.text.toString() + " Since you are the host, the channel will be deleted."
            }
        }, shareKey)

        dialogs.ok_quit_channel_confirmation_button.setOnClickListener {
            ServerRequest().quitChannel(shareKey)
            shareKey = gameKey
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

    private fun joinOrCreateChannel(view: View) {
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
            else if (channelNameField.text.length > 15) showMessage("Please a name with 15 characters or less.")
            else showMessage("Please the name of the channel you want to create.")
        }
    }

    private fun setMusicButton(){
        music_button_lobby.setOnClickListener {
            musicOn = !musicOn
            if(musicOn){
                music_button_lobby.setImageResource(R.drawable.ic_music)
                music_button_lobby.setPadding(15, 15, 17, 15)
                mediaPlayerMusic.start()
            }
            else{
                music_button_lobby.setImageResource(R.drawable.ic_music_off)
                music_button_lobby.setPadding(15, 15, 8, 15)
                mediaPlayerMusic.pause()
            }
        }
    }

    private fun showMessage(message: String?) {
        val root = findViewById<View>(android.R.id.content)
        val toast = Toast.makeText(this, message, Toast.LENGTH_SHORT)
        val yOffset = 0.coerceAtLeast(root.height - toast.yOffset)
        toast.setGravity(Gravity.TOP or Gravity.CENTER_HORIZONTAL, 0, yOffset)
        toast.show()
    }

    private fun setImageDrawableWithName(drawableName: String, imageView: ImageView){
        val context: Context = imageView.context
        val id: Int = context.resources.getIdentifier(drawableName, "drawable", context.packageName)
        imageView.setImageResource(id)
    }

    override fun finish() {
        super.finish()
        mediaPlayerMusic.pause()
    }

    private fun showNotification(){
        notification_popup_lobby.visibility = View.VISIBLE
    }

    private fun hideNotification(){
        notification_popup_lobby.visibility = View.GONE
    }

    // *************************** Tutorial Pop Up ***********************************************
    private fun tutorialPopUp(inflater: LayoutInflater) {
        tutorial_button_lobby.setOnClickListener {

            // Inflate a custom view using layout inflater
            val view = inflater.inflate(R.layout.tutorial_multiplayer, null)

            // Initialize a new instance of popup window
            val popupWindow = PopupWindow(view, ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, true)
            popupWindow.isOutsideTouchable = true
            message_edittext_lobby.isEnabled = false
            tutorial_button_lobby.isEnabled = false
            see_more_lobby.isEnabled = false
            music_button_lobby.isEnabled = false
            channels_settings_lobby.isEnabled = false
            arrow_drop_down_lobby.isEnabled = false
            channels_dropdown_lobby.isEnabled = false
            send_button_lobby.isEnabled = false

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
                message_edittext_lobby.isEnabled = true
                tutorial_button_lobby.isEnabled = true
                see_more_lobby.isEnabled = true
                music_button_lobby.isEnabled = true
                channels_settings_lobby.isEnabled = true
                arrow_drop_down_lobby.isEnabled = true
                channels_dropdown_lobby.isEnabled = true
                send_button_lobby.isEnabled = true

                indexClassicMode = 0
                tutorialImageView.setImageResource(arrayImagesClassicMode[0])
                tutorialTextView.text = listOfTextClassicMode[0]
                previousImageButton.visibility = View.INVISIBLE
                nextImageButton.visibility = View.VISIBLE
            }

            createPopUpWindowTransitions(popupWindow)
            popupWindow.softInputMode = WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE

            // Show the popup window on app
            TransitionManager.beginDelayedTransition(activity_lobby)
            popupWindow.showAtLocation(
                activity_lobby,
                Gravity.CENTER,
                0,
                0)
        }
    }
}
