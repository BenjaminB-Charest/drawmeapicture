package com.example.polydessinmobile

import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.graphics.drawable.ColorDrawable
import android.media.MediaPlayer
import android.os.Bundle
import android.text.method.ScrollingMovementMethod
import android.transition.Slide
import android.transition.TransitionManager
import android.util.Log
import android.util.TypedValue
import android.view.*
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.setPadding
import com.github.kittinunf.fuel.Fuel
import com.github.kittinunf.fuel.core.extensions.jsonBody
import com.google.firebase.auth.ktx.auth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.ktx.Firebase
import kotlinx.android.synthetic.main.activity_create_lobby.*
import kotlinx.android.synthetic.main.activity_main_menu.*
import kotlinx.android.synthetic.main.activity_multiplayer_drawing.*
import kotlinx.android.synthetic.main.choose_difficulty.*
import kotlinx.android.synthetic.main.confirm_quit_channel.*
import kotlinx.android.synthetic.main.join_create_dialog.*
import java.text.SimpleDateFormat
import java.util.*


class MainMenuActivity : AppCompatActivity() {

    // images array Sprint Solo
    private var arrayImagesSprintSolo = intArrayOf(
            R.drawable.a_create_game_solo,
            R.drawable.b_choose_difficulty_solo,
            R.drawable.c_game_view_good_guess_solo,
            R.drawable.d_game_view_bad_guess_solo,
            R.drawable.f_tutorial,
            R.drawable.e_game_over_solo
    )

    // images array Classic Mode
    private var arrayImagesClassicMode = intArrayOf(
            R.drawable.a_create_game,
            R.drawable.b_select_option,
            R.drawable.c_game_info,
            R.drawable.d_join_game,
            R.drawable.e_join_game_button,
            R.drawable.f_lobby_creator_view,
            R.drawable.g_lobby_joiner_view,
            R.drawable.h_drawer_tools,
            R.drawable.i_guess_word,
            R.drawable.k_whos_drawing,
            R.drawable.j_game_over
    )

    private var listOfTextSprintSolo = arrayOf(
            "Introduction: Solo Sprint is a game mode against a virtual player where you try to guess the most words before the timer runs out.",
            "Difficulty selection: Depending on the difficulty, the player has a limited time to guess the bot's drawing.",
            "Game view: On each good answer, the player wins points and time depending on the difficulty level. When the player guesses the good word, additional time will be added on the timer. The number of hints depends on the difficulty level. Accessing the hints does not take away any points.",
            "Game view: On each bad answer, the player loses an attempt. If no attempts are left, another drawing is shown. ",
            "Tutorial: If the player opens the tutorial, the time and the drawing are paused.",
            "Game over: The game finishes if the time runs out."
    )

    private var listOfTextClassicMode = arrayOf(
            "Introduction: Classic Mode is a 2 vs 2 game mode with at least 1 human player on each team.",
            "Choose an option: The player has the option of creating or joining a game.",
            "Create a game: When creating a game, the player can provide a game name, choose the difficulty level and choose if the game is public or private.",
            "Join a game: When joining a game, the player can join with a key.",
            "Join a game: The player can join a game by clicking on the Join button.",
            "Lobby - Creator's view: The player can open the tutorial, add or remove a bot. You can also begin or quit the game.",
            "Lobby - Joiner's view: The player can turn off the music and chat other players in the desired channel.",
            "Game view: While drawing, the player has acces on a variety of tools for drawing such as the pencil, the eraser and the grid. You can also change the opacity of the tools.",
            "Game view: While guessing, the player can guess the word and can get a maximum of 3 hints. Accessing the hints does not take away any points.",
            "Game view: On the left side, the player can see who's turn it is.",
            "Game over: When the game is over, you can go back to the main menu.")

    // Défilement d'images
    private var indexSprintSolo = 0
    private var indexClassicMode = 0

    // Défilement de texte
    private var currentTextSprintSolo = listOfTextSprintSolo[0]
    private var currentTextClassicMode = listOfTextClassicMode[0]

    private var isTutorial = false
    private var isFirstNewPage = true


    // Music
    private lateinit var mediaPlayerMusic: MediaPlayer
    private lateinit var mediaPlayerMusicReceiveMessage: MediaPlayer
    private var isJoining = true
    private var level = 0

    // Chat
    lateinit var chatBox: TextView
    private var shareKey = "ABCDEF"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main_menu)

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

        isTutorial = intent.getStringExtra("isTutorial") == "true"


        //************************ Music ***********************************
        setMusic()

        //************************ Pop up **********************************
        // Initialize a new layout inflater instance of chat popup
        val inflater: LayoutInflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        chatPopUp(inflater)

        tutorial_main_menu.setOnClickListener {
            tutorialPopUp(inflater)
        }

        // ********************** Avatars **********************************
        // Avatars pris de : "https://www.vecteezy.com/free-vector/cartoon" Cartoon Vectors by Vecteezy
        // Afficher l'avatar du joueur
        ServerRequest().getAvatar(object : MyCallBackString {
            override fun onCallBack(value: String) {
                val avatarResourceId: Int = resources.getIdentifier(value, "drawable", packageName)
                user_avatar_menu.setImageDrawable(resources.getDrawable(avatarResourceId, theme))
                setImageDrawableWithName(value, user_avatar_menu)
                if (isTutorial){
                    tutorialPopUp(inflater)
                }
            }
        })

        // Afficher le username du joueur
        username_menu.text = ServerRequest().getUsernameEmail()

        // Afficher le level du joueur
        ServerRequest().getExperience(object : MyCallBackInt {
            override fun onCallBack(value: Int) {
                level = value / 20 + 1
                val textLevel = "Level $level"
                level_menu.text = textLevel
                setOptionsOnClickListeners()
            }
        })

        ServerRequest().getMoney(object : MyCallBackInt {
            override fun onCallBack(value: Int) {
                money_value.text = value.toString()
            }
        })

        logout_text.setOnClickListener {
            ServerRequest().setLoginHistory()
            ServerRequest().setIsLogginOff()
            loginServerId = ""
            isFirstOnStart = true
            Firebase.auth.signOut()
            goToLogin()
        }

        logout_icon.setOnClickListener {
            ServerRequest().setLoginHistory()
            ServerRequest().setIsLogginOff()
            loginServerId = ""
            isFirstOnStart = true
            Firebase.auth.signOut()
            goToLogin()
        }

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

    private fun setOptionsOnClickListeners() {
        classic_mode_button.setOnClickListener {
            openLobbyChoiceDialog()
        }
        if (level != 1) solo_sprint_mode_button.backgroundTintList = ContextCompat.getColorStateList(this, R.color.colorAccent)
        solo_sprint_mode_button.setOnClickListener {
            if(level == 1) {
                showMessage("You must be at least level 2 to play in this mode!")
            }
            else {
                openDifficultyDialog()
            }
        }
        leaderboard.setOnClickListener {
            mediaPlayerMusic.pause()
            startActivity(Intent(this, LeaderboardActivity::class.java))
        }
    }

    fun moneyOnClickListener(view: View){
        showMessage("Use the web version of the game to access the shop!")
    }

    private fun openDifficultyDialog(){
        val dialogDifficulty = Dialog(this)
        dialogDifficulty.requestWindowFeature(Window.FEATURE_NO_TITLE)
        dialogDifficulty.setContentView(R.layout.choose_difficulty)

        val buttonDifficulty = mapOf(dialogDifficulty.easy_button to "easy", dialogDifficulty.normal_button to "normal", dialogDifficulty.hard_button to "hard")

        for(button in buttonDifficulty.keys){
            button.setOnClickListener {
                Fuel.post("https://us-central1-chat-b68d4.cloudfunctions.net/createSoloGame")
                        .jsonBody("{ \"host\" : \"" + ServerRequest().getUsernameEmail() + "\", \"difficulty\" : \"" + buttonDifficulty[button] + "\" }")
                        .responseString { _, _, result ->
                            Log.d("DocSnippets", result.get().substring(19, result.get().length - 3))
                            val gameId = result.get().substring(19, result.get().length - 3)
                            val intent = Intent(this, SprintSoloActivity::class.java)
                            intent.putExtra("gameId", gameId)
                            startActivity(intent)
                            mediaPlayerMusic.pause()
                            dialogDifficulty.dismiss()
                        }
                dialogDifficulty.easy_button.setOnClickListener {  showMessage("Please wait")}
                dialogDifficulty.normal_button.setOnClickListener {  showMessage("Please wait")}
                dialogDifficulty.hard_button.setOnClickListener {  showMessage("Please wait")}
            }
        }
        dialogDifficulty.show()
    }

    private fun openLobbyChoiceDialog(){
        val dialogLobby = Dialog(this)
        dialogLobby.requestWindowFeature(Window.FEATURE_NO_TITLE)
        dialogLobby.setContentView(R.layout.join_create_dialog)
        dialogLobby.create_lobby_button.setOnClickListener {
            mediaPlayerMusic.pause()
            val intent = Intent(this, CreateLobbyActivity::class.java)
            startActivity(intent)
            dialogLobby.dismiss()
        }
        dialogLobby.join_lobby_button.setOnClickListener {
            mediaPlayerMusic.pause()
            val intent = Intent(this, JoinLobbyActivity::class.java)
            startActivity(intent)
            dialogLobby.dismiss()
        }
        dialogLobby.show()
    }

    /** Called when the user taps the profile button */
    fun openUserProfile(view: View) {
        startActivity(Intent(this, UserProfileActivity::class.java))
        mediaPlayerMusic.pause()
    }

    private fun goToLogin() {
        startActivity(Intent(this, MainActivity::class.java))
        mediaPlayerMusic.pause()
        finish()
    }

    private fun setImageDrawableWithName(drawableName: String, imageView: ImageView){
        val context: Context = imageView.context
        val id: Int = context.resources.getIdentifier(drawableName, "drawable", context.packageName)
        imageView.setImageResource(id)
    }


    // *************************** Chat popup *****************************************
    private fun chatPopUp(inflater: LayoutInflater) {
        chat_button_popup.setOnClickListener {
            // Inflate a custom view using layout inflater
            val view = inflater.inflate(R.layout.chat_pop_up, null)

            // Initialize a new instance of popup window
            val popupWindow = PopupWindow(view, ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, true)
            createPopUpWindowTransitions(popupWindow)

            val exitButton = view.findViewById<ImageButton>(R.id.exit_chat_popup)
            val messageEditText = view.findViewById<EditText>(R.id.eddit_text_popup)
            val sendButton = view.findViewById<Button>(R.id.send_button_popup)
            chatBox = view.findViewById(R.id.chat_messages_popup)
            chatBox.movementMethod = ScrollingMovementMethod()
            exitPopUp(popupWindow, exitButton)
            setChannelsDropDown(view)
            setChannelOptionToggle(view)
            setSeeMoreButton(view)
            setQuitChannelButton(view)

            // *************************** Chat ************************************
            var sentMessageTime = FieldValue.serverTimestamp()

            messageEditText.setOnKeyListener(View.OnKeyListener { _, keyCode, event ->
                if (keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_UP) {
                    sendMessage(sentMessageTime, shareKey, messageEditText)
                    return@OnKeyListener true
                }
                false
            })

            sendButton.setOnClickListener {
                sendMessage(sentMessageTime, shareKey, messageEditText)
            }

            popupWindow.softInputMode = WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE

            // Show the popup window on app
            TransitionManager.beginDelayedTransition(activity_main_menu)
            popupWindow.showAtLocation(
                    activity_main_menu,
                    Gravity.CENTER,
                    0,
                    0)
        }
    }

    private fun showAllMessageChannel(messages: MutableList<Message>) {
        chatBox.text = ""
        for (v in messages) textBoxShowChat("[${SimpleDateFormat("HH:mm:ss").format(v.date)}] ${v.sender} : ${v.content}")
    }

    private fun sendMessage(date: FieldValue, channel: String, editTextBox: EditText) {
        if(editTextBox.text.toString().isNotBlank()) ServerRequest().addMessage(editTextBox.text.toString(), date, channel)
        editTextBox.text.clear()
    }

    private fun setChannelOptionToggle(view: View){
        val radioJoin = view.findViewById<RadioButton>(R.id.radio_join)
        val radioCreate = view.findViewById<RadioButton>(R.id.radio_create)
        val enterChannelButton = view.findViewById<ImageButton>(R.id.enter_channel_button)
        val channelNameField = view.findViewById<EditText>(R.id.edit_text_channel)
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
        val channelNameField = view.findViewById<EditText>(R.id.edit_text_channel)
        if(isJoining){
            if(channelNameField.text.isNotEmpty()){
                val shareKey = channelNameField.text.toString().toUpperCase()
                ServerRequest().channelsIsExisting(object: MyCallBackBool {
                    override fun onCallBack(value: Boolean) {
                        if (value) {
                            ServerRequest().setChannelsUsers(shareKey)
                            channelNameField.text.clear()
                        }
                        else showMessage("The key you entered is not valid.")
                    }
                }, shareKey)

                val channelDropDown = view.findViewById<Spinner>(R.id.channel_drop_down_popup)
                // TODO : Trouver l'index du nouveau channel dans la liste de channels et le définir comme actif

                //channelDropDown.setSelection(2)
            }
            else showMessage("Please the share key of the channel you want to join.")
        }
        else{
            if(channelNameField.text.isNotEmpty()){
                val channelDropDown = view.findViewById<Spinner>(R.id.channel_drop_down_popup)
                // TODO : Trouver l'index du nouveau channel dans la liste de channels et le définir comme actif

                ServerRequest().addChannel(true, channelNameField.text.toString())
                channelNameField.text.clear()
            }
            else if (channelNameField.text.length > 15) showMessage("Please a name with 15 characters or less.")
            else showMessage("Please the name of the channel you want to create.")
        }
    }

    private fun setSeeMoreButton(view: View){
        val seeMoreButton = view.findViewById<TextView>(R.id.see_more_popup)
        seeMoreButton.setOnClickListener {
            // TODO : Loader l'historique du chat pour le channel actif
            isShowingAllMessages = true
            ServerRequest().getMessages(object : MyCallBackMessageList {
                override fun onCallBack(value: MutableList<Message>) {
                    showAllMessageChannel(value)
                }
            }, shareKey)
        }
    }

    private fun setQuitChannelButton(view: View){
        val quitChannelButton = view.findViewById<Button>(R.id.quit_channel_button)
        if(shareKey == "ABCDEF"){
            quitChannelButton.setBackgroundResource(R.drawable.quit_button_disabled)
        }
        else quitChannelButton.setBackgroundResource(R.drawable.quit_button_enabled)

        // TODO : Changer le channel actif pour le general channel
        quitChannelButton.setOnClickListener {
            if (shareKey != "ABCDEF") confirmationQuitChannelDialog()
            else showMessage("Can't quit the General channel")
        }

        // TODO : Retirer le canal de la liste des canaux du joueur

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
            ServerRequest().quitChannel(shareKey)
            dialogs.dismiss()
        }
        dialogs.cancel_quit_channel_confirmation_button.setOnClickListener {
            dialogs.dismiss()
        }
        dialogs.show()
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

    private fun exitPopUp(popupWindow: PopupWindow, exitButton: ImageButton){
        exitButton.setOnClickListener {
            popupWindow.dismiss()
        }
    }


    private fun textBoxShowChat(message: String) {
        val newTextBox = chatBox.text.toString() + "\n" + message
        chatBox.setText(newTextBox).toString()
    }

    // CHANNELS
    private fun setChannelsDropDown(viewChannel: View){

        ServerRequest().getChannels(object : MyCallBackChannelsServer{
            override fun onCallBack(value: MutableList<ChannelServer>) {
                var list = mutableListOf<String>()
                for (v in value) list.add(v.name + "  | Key :  " + v.key)
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
                        val channelDropDownPopup = viewChannel.findViewById<Spinner>(R.id.channel_drop_down_popup)
                        if (position == channelDropDownPopup.selectedItemPosition) {
                            viewSpinner.background = ColorDrawable(ContextCompat.getColor(context, R.color.colorPrimaryMedium))
                        }
                        return viewSpinner
                    }
                }

                // finally, data bind spinner with adapter
                val channelDropDown = viewChannel.findViewById<Spinner>(R.id.channel_drop_down_popup)
                channelDropDown.adapter = adapter

                for (v in value) if (channelDropDown.selectedItem.toString().contains(v.key)) shareKey = v.key

                // set up initial selection
                channelDropDown.setSelection(0) // Pas utile pour l'instant

                channelDropDown.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
                    override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                        for (v in value) if (parent?.getItemAtPosition(position).toString().contains(v.key)) shareKey = v.key
                        isViewChannel[shareKey] = true
                        showOrHideNotif()
                        setQuitChannelButton(viewChannel)
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

    private fun showNotification(){
        notification_popup.visibility = View.VISIBLE
    }

    private fun hideNotification(){
        notification_popup.visibility = View.GONE
    }

    private fun showMessage(message: String?) {
        val toast = Toast.makeText(this, message, Toast.LENGTH_SHORT)
        toast.setGravity(Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL, 0, 500)
        toast.show()
    }

    //************************ Music ***********************************
    private fun setMusic(){
        mediaPlayerMusic =  MediaPlayer.create(this, R.raw.king_music)
        mediaPlayerMusic.setVolume(0.6F, 0.6F)
        mediaPlayerMusic.isLooping = true
        ServerRequest().getMusicOn(object : MyCallBackBool{
            override fun onCallBack(value: Boolean) {
                if(value) mediaPlayerMusic.start()
            }
        })
    }

    // *************************** Tutorial Pop Up ***********************************************
    private fun tutorialPopUp(inflater: LayoutInflater) {
        // Inflate a custom view using layout inflater
        val view = inflater.inflate(R.layout.tutorial_main_menu, null)

        // Initialize a new instance of popup window
        val popupWindow = PopupWindow(
                view,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                true
        )
        popupWindow.isOutsideTouchable = true
        chat_button_popup.isEnabled = false
        logout_icon.isEnabled = false
        logout_text.isEnabled = false
        money_icon.isEnabled = false
        user_avatar_menu.isEnabled = false
        username_menu.isEnabled = false
        level_menu.isEnabled = false
        edit_profile_menu.isEnabled = false

        val nextImageButton = view.findViewById<ImageButton>(R.id.next_button)
        val previousImageButton = view.findViewById<ImageButton>(R.id.previous_button)
        val exitTutorialButton = view.findViewById<ImageButton>(R.id.close_tutorial_button)
        val tutorialImageView = view.findViewById<ImageView>(R.id.tutorial_images_main_menu)
        val tutorialTextView = view.findViewById<TextView>(R.id.text_description)
        val classicButton = view.findViewById<Button>(R.id.classic_button_tutorial_main_menu)
        val sprintSoloButton = view.findViewById<Button>(R.id.solo_button_tutorial_main_menu)


        // cas 1) Aucun bouton Classic ou Solo n'est pesé
        previousImageButton.visibility = View.INVISIBLE
        nextImageButton.visibility = View.VISIBLE
        tutorialImageView.setImageResource(arrayImagesClassicMode[0])
        currentTextClassicMode = listOfTextClassicMode[0]
        tutorialTextView.text = listOfTextClassicMode[0]
        indexClassicMode = 0
        indexSprintSolo = 0

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

        // Cas 2) Sprint Solo
            sprintSoloButton.setOnClickListener {
                sprintSoloButton.setBackgroundResource(R.drawable.rounded_corners_button_yellow_border)
                classicButton.setBackgroundResource(R.drawable.rounded_corners_button_pale_yellow)

                tutorialImageView.setImageResource(arrayImagesSprintSolo[0])
                tutorialTextView.text = listOfTextSprintSolo[0]
                currentTextSprintSolo = listOfTextSprintSolo[0]
                previousImageButton.visibility = View.INVISIBLE
                nextImageButton.visibility = View.VISIBLE
                indexSprintSolo = 0
                indexClassicMode = 0

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
            }

        // Cas 3) Mode classique
            classicButton.setOnClickListener {
                classicButton.setBackgroundResource(R.drawable.rounded_corners_button_yellow_border)
                sprintSoloButton.setBackgroundResource(R.drawable.rounded_corners_button_pale_yellow)

                tutorialImageView.setImageResource(arrayImagesClassicMode[0])
                tutorialTextView.text = listOfTextClassicMode[0]
                nextImageButton.visibility = View.VISIBLE
                previousImageButton.visibility = View.INVISIBLE
                indexClassicMode = 0
                indexSprintSolo = 0

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
            }

        exitTutorialButton.setOnClickListener {
            popupWindow.dismiss()
            tutorialImageView.setImageResource(arrayImagesClassicMode[0])
            tutorialTextView.text = listOfTextClassicMode[0]
            indexClassicMode = 0
            indexSprintSolo = 0
            previousImageButton.visibility = View.INVISIBLE
            nextImageButton.visibility = View.VISIBLE
        }

        popupWindow.setOnDismissListener {
            chat_button_popup.isEnabled = true
            logout_icon.isEnabled = true
            logout_text.isEnabled = true
            money_icon.isEnabled = true
            user_avatar_menu.isEnabled = true
            username_menu.isEnabled = true
            level_menu.isEnabled = true
            edit_profile_menu.isEnabled = true

            tutorialImageView.setImageResource(arrayImagesClassicMode[0])
            tutorialTextView.text = listOfTextClassicMode[0]
            indexClassicMode = 0
            indexSprintSolo = 0
            previousImageButton.visibility = View.INVISIBLE
            nextImageButton.visibility = View.VISIBLE
        }

        createPopUpWindowTransitions(popupWindow)
        popupWindow.softInputMode = WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE

        // Show the popup window on app
        TransitionManager.beginDelayedTransition(activity_main_menu)
        popupWindow.showAtLocation(
                activity_main_menu,
                Gravity.CENTER,
                0,
                0
        )
    }

}
