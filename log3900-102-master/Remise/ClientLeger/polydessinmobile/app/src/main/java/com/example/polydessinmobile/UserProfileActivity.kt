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
import com.google.firebase.firestore.FieldValue
import kotlinx.android.synthetic.main.activity_login_history.*
import com.google.firebase.auth.ktx.auth
import com.google.firebase.firestore.DocumentReference
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import kotlinx.android.synthetic.main.activity_main_menu.*
import kotlinx.android.synthetic.main.activity_user_profile.*
import kotlinx.android.synthetic.main.confirm_quit_channel.*
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.floor

class UserProfileActivity : AppCompatActivity(){

    // Music
    private lateinit var mediaPlayerMusic: MediaPlayer
    private lateinit var mediaPlayerMusicReceiveMessage: MediaPlayer

    // Chat
    lateinit var chatBox: TextView
    private var shareKey = "ABCDEF"
    private var isJoining = true
    private var isFirstNewPage = true


    private var currentBadges = arrayListOf("noBadge", "noBadge", "noBadge")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_user_profile)

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

        //************************ Music ***********************************
        setMusic()

        //************************ Pop up **********************************
        // Initialize a new layout inflater instance of chat popup
        val inflater: LayoutInflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        chatPopUp(inflater)

        title = "User Profile"


        music_switch?.setOnCheckedChangeListener { _, isChecked ->
            if(isChecked) {
                ServerRequest().setToggleMusic(true)
                mediaPlayerMusic.start()
            }
            else {
                ServerRequest().setToggleMusic(false)
                mediaPlayerMusic.pause()
            }
        }

        robot_switch?.setOnCheckedChangeListener { _, isChecked ->
            if(isChecked) {
                ServerRequest().setToggleVP(true)
            }
            else {
                ServerRequest().setToggleVP(false)
            }
        }

        ServerRequest().getSelectedBadges(object : MyCallBackStringArray{
            override fun onCallBack(value: ArrayList<String>) {
                currentBadges = value
                setNoBadgeOnClickListener()
                setProfilValues()
            }
        }, ServerRequest().getUsernameEmail())

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

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        // Mettre la progression au bon niveau
        ServerRequest().getExperience(object : MyCallBackInt {
            override fun onCallBack(value: Int) {
                progress_bar_profile.requestLayout()
                progress_bar_profile.layoutParams.width = level_bar_profile.width * (value % 20) / 20
                val level : Int = value / 20 + 1
                level_value_profile.text = level.toString()
                progression_value_profile.text = ((value % 20).toString() + "/20")
            }
        })
    }

    override fun onDestroy() {
        super.onDestroy()
        ServerRequest().destroyNotificationListener()
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

    fun openEditProfile(view: View) {
        startActivity(Intent(this, EditProfileActivity::class.java))
        mediaPlayerMusic.pause()
    }

    fun openLoginHistory(view: View) {
        startActivity(Intent(this, LoginHistoryActivity::class.java))
    }

    fun openGameHistory(view: View) {
        startActivity(Intent(this, GameHistoryActivity::class.java))
    }

    fun setProfilValues() {
        // Avatars pris de : "https://www.vecteezy.com/free-vector/cartoon" Cartoon Vectors by Vecteezy
        // Badges faits par "https://www.flaticon.com/authors/made-by-made" Made by Made

        // Afficher l'avatar du joueur
        ServerRequest().getAvatar(object : MyCallBackString {
            override fun onCallBack(value: String) {
                val avatarResourceId: Int = resources.getIdentifier(value, "drawable", packageName)
                user_avatar_profile.setImageDrawable(resources.getDrawable(avatarResourceId, theme))
                setImageDrawableWithName(value, user_avatar_profile)
            }
        })

        // Afficher le username du joueur
        username_profile.text = ServerRequest().getUsernameEmail()

        // Afficher le firstname du joueur
        ServerRequest().getFirstName(object : MyCallBackString {
            override fun onCallBack(value: String) {
                firstname_profile.text = value
            }
        })

        // Afficher le lastname du joueur
        ServerRequest().getLastName(object : MyCallBackString {
            override fun onCallBack(value: String) {
                lastname_profile.text = value
            }
        })

        setImageDrawableWithName("ic_" + currentBadges[0], badge1_profile)
        setImageDrawableWithName("ic_" + currentBadges[1], badge2_profile)
        setImageDrawableWithName("ic_" + currentBadges[2], badge3_profile)

        // Afficher le paramètre de musique
        ServerRequest().getMusicOn(object : MyCallBackBool{
            override fun onCallBack(value: Boolean) {
                music_switch.isChecked = value
                if(value) mediaPlayerMusic.start()
            }
        })

        // Afficher le paramètre de voix des robots
        ServerRequest().getRobotVoiceOn(object : MyCallBackBool{
            override fun onCallBack(value: Boolean) {
                robot_switch.isChecked = value
            }
        })

        // TODO : Split classique / solo (JUSTIN EFFACE MOI QUAND C'EST FAIT)

        ServerRequest().getClassicModeStats(object : MyCallBackClassicStats {
            override fun onCallBack(value: ClassicStats) {
                game_played_value_classic.text = value.nbGamePlayed.toString()
                victory_percentage_value_classic.text = String.format("%.2f", value.percentageVictory * 100) + " %"
                var averageTime = 0
                if (value.nbGamePlayed != 0) averageTime = value.totalTimeSecond / value.nbGamePlayed
                val nbMinAverage = floor(averageTime.toDouble() / 60).toInt()
                game_time_average_value_classic.text = nbMinAverage.toString() + "m " + (averageTime - nbMinAverage * 60) + "s"
                val nbHour = floor(value.totalTimeSecond.toDouble() / 3600).toInt()
                val nbMin = floor((value.totalTimeSecond.toDouble() - nbHour.toDouble() * 3600) / 60).toInt()
                total_game_time_value_classic.text = nbHour.toString() + "h "+ nbMin + "m " + (value.totalTimeSecond - nbHour * 3600 - nbMin * 60) + "s"
                best_score_value_classic.text = value.bestScore.toString() + " points"
            }
        })

        ServerRequest().getSoloSprintStats(object : MyCallBackSprintSoloStats {
            override fun onCallBack(value: SprintSoloStats) {
                game_played_value_solo.text = value.nbGamesPlayed.toString()
                var averageTime = 0
                if (value.nbGamesPlayed != 0) averageTime = value.totalTimeSecond / value.nbGamesPlayed
                val nbMinAverage = floor(averageTime.toDouble() / 60).toInt()
                game_time_average_value_solo.text = nbMinAverage.toString() + "m " + (averageTime - nbMinAverage * 60) + "s"
                val nbHour = floor(value.totalTimeSecond.toDouble() / 3600).toInt()
                val nbMin = floor((value.totalTimeSecond.toDouble() - nbHour.toDouble() * 3600) / 60).toInt()
                total_game_time_value_solo.text = nbHour.toString() + "h "+ nbMin + "m " + (value.totalTimeSecond - nbHour * 3600 - nbMin * 60) + "s"
                best_score_value_solo.text = value.bestScore.toString() + " points"
            }
        })
    }

    override fun onPause() {
        super.onPause()
        ServerRequest().setLoginHistory()
        ServerRequest().setIsLogginOff()
    }

    private fun setNoBadgeOnClickListener(){
        if(currentBadges[0] == "noBadge"){
            setNotAvailableOnClickListener(badge1_profile, "You don't have enough badges unlocked yet!")
        }
        if(currentBadges[1] == "noBadge") {
            setNotAvailableOnClickListener(badge2_profile, "You don't have enough badges unlocked yet!")
        }
        if(currentBadges[2] == "noBadge") {
            setNotAvailableOnClickListener(badge3_profile, "You don't have enough badges unlocked yet!")
        }
    }

    private fun setNotAvailableOnClickListener(avatar: ImageView, message: String){
        avatar.setOnClickListener{
            showMessage(message)
        }
    }

    private fun showMessage(message: String?) {
        val root = findViewById<View>(android.R.id.content)
        val toast = Toast.makeText(this, message, Toast.LENGTH_SHORT)
        val yOffset = 0.coerceAtLeast(root.height - toast.yOffset + 20)
        toast.setGravity(Gravity.TOP or Gravity.CENTER_HORIZONTAL, 0, yOffset)
        toast.show()
    }

    private fun setImageDrawableWithName(drawableName: String, imageView: ImageView){
        val id: Int = this.resources.getIdentifier(drawableName, "drawable", this.packageName)
        imageView.setImageResource(id)
    }

    // *************************** Chat popup *****************************************
    private fun chatPopUp(inflater: LayoutInflater) {
        chat_button_popup_user_profile.setOnClickListener {
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
            TransitionManager.beginDelayedTransition(activity_user_profile)
            popupWindow.showAtLocation(
                    activity_user_profile,
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
        notification_popup_user_profile.visibility = View.VISIBLE
    }

    private fun hideNotification(){
        notification_popup_user_profile.visibility = View.GONE
    }

    //************************ Music ***********************************
    private fun setMusic(){
        mediaPlayerMusic =  MediaPlayer.create(this, R.raw.epic_music)
        mediaPlayerMusic.setVolume(0.6F, 0.6F)
        mediaPlayerMusic.isLooping = true
        ServerRequest().getMusicOn(object : MyCallBackBool{
            override fun onCallBack(value: Boolean) {
                if(value) mediaPlayerMusic.start()
            }
        })
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        when (item.itemId) {
            android.R.id.home -> {
                onBackPressed()
                mediaPlayerMusic.pause()
                return super.onOptionsItemSelected(item)
            }
        }
        return super.onOptionsItemSelected(item)
    }
}