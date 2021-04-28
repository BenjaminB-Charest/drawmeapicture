package com.example.polydessinmobile

import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.graphics.ColorMatrix
import android.graphics.ColorMatrixColorFilter
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
import com.google.firebase.auth.ktx.auth
import com.google.firebase.ktx.Firebase
import androidx.core.view.setPadding
import com.google.firebase.firestore.FieldValue
import kotlinx.android.synthetic.main.activity_edit_profile.*
import kotlinx.android.synthetic.main.activity_leaderboard.*
import kotlinx.android.synthetic.main.activity_user_profile.*
import kotlinx.android.synthetic.main.confirm_quit_channel.*
import java.text.SimpleDateFormat
import java.util.*
import kotlin.collections.ArrayList


open class EditProfileActivity : AppCompatActivity() {

    // Avatars pris de : "https://www.vecteezy.com/free-vector/cartoon" Cartoon Vectors by Vecteezy
    // Badges faits par "https://www.flaticon.com/authors/made-by-made" Made by Made

    private var currentBadges = arrayListOf<String>()
    private var unlockedBadges = arrayListOf<String>()
    private var isFirstNewPage = true

    // Chat
    lateinit var chatBox: TextView
    private var shareKey = "ABCDEF"
    private var isJoining = true

    // Music
    private lateinit var mediaPlayerMusic: MediaPlayer
    private lateinit var mediaPlayerMusicReceiveMessage: MediaPlayer

    enum class ImageType {
        AVATAR, BADGE
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_edit_profile)

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

        title = "Edit profile"

        setAvatarProfile()
        setMusic()

        //************************ Pop up **********************************
        // Initialize a new layout inflater instance of chat popup
        val inflaterChat: LayoutInflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        chatPopUp(inflaterChat)

        // Initialize a new layout inflater instance
        val inflater: LayoutInflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        setEditAvatarOnClickListener(inflater)

        ServerRequest().getSelectedBadges(object : MyCallBackStringArray{
            override fun onCallBack(value: ArrayList<String>) {
                currentBadges = value
                setBadgesProfile()
                ServerRequest().getUnlockedBadges(object : MyCallBackStringArray{
                    override fun onCallBack(value2: ArrayList<String>) {
                        unlockedBadges = value2
                        enableOrDisableBadgesOnClickListener(inflater)
                    }
                })
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

    override fun onDestroy() {
        super.onDestroy()
        ServerRequest().destroyNotificationListener()
    }

    private fun enableOrDisableBadgesOnClickListener(inflater: LayoutInflater){
        if(unlockedBadges.size > 3){
            setEditBadgeOnClickListener(inflater, edit_badge1_button, badge1_edit_profile)
            setEditBadgeOnClickListener(inflater, edit_badge2_button, badge2_edit_profile)
            setEditBadgeOnClickListener(inflater, edit_badge3_button, badge3_edit_profile)
        }
        else{
            setUnabledEditBadgeButtonsOnClickListener()
            if(currentBadges[0] == "noBadge"){
                setNotAvailableOnClickListener(badge1_edit_profile, "You don't have enough badges unlocked yet!")
            }
            if(currentBadges[1] == "noBadge") {
                setNotAvailableOnClickListener(badge2_edit_profile, "You don't have enough badges unlocked yet!")
            }
            if(currentBadges[2] == "noBadge") {
                setNotAvailableOnClickListener(badge3_edit_profile, "You don't have enough badges unlocked yet!")
            }
        }
    }

    private fun setUnabledEditBadgeButtonsOnClickListener() {
        for(badgeButton in arrayOf(edit_badge1_button, edit_badge2_button, edit_badge3_button)){
            setLocked(badgeButton, true)
            badgeButton.setOnClickListener{
                showMessage("Unlock at least 4 badges to edit your badges!")
            }
        }
    }


    private fun setAvatarProfile(){

        // Afficher l'avatar du joueur
        ServerRequest().getAvatar(object : MyCallBackString{
            override fun onCallBack(value: String) {
                setImageDrawableWithName(value, user_avatar_edit_profile)
            }
        })
    }

    private fun setImageDrawableWithName(drawableName: String, imageView: ImageView){
        val id: Int = this.resources.getIdentifier(drawableName, "drawable", this.packageName)
        imageView.setImageResource(id)
    }

    private fun setEditAvatarOnClickListener(inflater: LayoutInflater) {
        edit_profile_avatar_button.setOnClickListener {

            // Inflate a custom view using layout inflater
            val view = inflater.inflate(R.layout.activity_edit_avatar, null)

            val avatars = mapOf(view.findViewById<ImageView>(R.id.avatar1_edit_avatar) to "girl",
                view.findViewById<ImageView>(R.id.avatar2_edit_avatar) to "male",
                view.findViewById<ImageView>(R.id.avatar3_edit_avatar) to "cat",
                view.findViewById<ImageView>(R.id.avatar4_edit_avatar) to "dog",
                view.findViewById<ImageView>(R.id.avatar5_edit_avatar) to "fox",
                view.findViewById<ImageView>(R.id.avatar6_edit_avatar) to "panda_bear",
                view.findViewById<ImageView>(R.id.avatar7_edit_avatar) to "flamingo",
                view.findViewById<ImageView>(R.id.avatar8_edit_avatar) to "yak",
                view.findViewById<ImageView>(R.id.avatar9_edit_avatar) to "koala",
                view.findViewById<ImageView>(R.id.avatar10_edit_avatar) to "bee",
                view.findViewById<ImageView>(R.id.avatar11_edit_avatar) to "giraffe",
                view.findViewById<ImageView>(R.id.avatar12_edit_avatar) to "polar_bear",
                view.findViewById<ImageView>(R.id.avatar13_edit_avatar) to "rhino",
                view.findViewById<ImageView>(R.id.avatar14_edit_avatar) to "monkey",
                view.findViewById<ImageView>(R.id.avatar15_edit_avatar) to "rabbit",
                view.findViewById<ImageView>(R.id.avatar16_edit_avatar) to "lion",
                view.findViewById<ImageView>(R.id.avatar17_edit_avatar) to "raccoon",
                view.findViewById<ImageView>(R.id.avatar18_edit_avatar) to "octopus",
                view.findViewById<ImageView>(R.id.avatar19_edit_avatar) to "leopard",
                view.findViewById<ImageView>(R.id.avatar20_edit_avatar) to "elephant")

            // Initialize a new instance of popup window
            val popupWindow = PopupWindow(view, ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, true)
            createPopUpWindowTransitions(popupWindow)

            // Afficher l'avatar du joueur dans la popup window
            val userAvatar = view.findViewById<ImageView>(R.id.user_avatar_edit_avatar)
            userAvatar.setImageDrawable(user_avatar_edit_profile.drawable)

            setAvatarsOnClickListeners(view, avatars)

            val okButton = view.findViewById<Button>(R.id.ok_avatar_button)
            val cancelButton = view.findViewById<Button>(R.id.cancel_avatar_button)
            setButtonsOnClickListener(popupWindow, okButton, cancelButton, userAvatar, user_avatar_edit_profile, ImageType.AVATAR)

            // Finally, show the popup window on app
            TransitionManager.beginDelayedTransition(edit_profile_layout)
            popupWindow.showAtLocation(
                edit_profile_layout, // Location to display popup window
                Gravity.CENTER, // Exact position of layout to display popup
                0, // X offset
                0 // Y offset
            )
        }

    }

    private fun setEditBadgeOnClickListener(inflater: LayoutInflater, editBadgeButton: ImageView, userBadgeProfile: ImageView) {
        editBadgeButton.setOnClickListener {
            // Inflate a custom view using layout inflater
            val view = inflater.inflate(R.layout.edit_badge, null)

            val badges = mapOf(view.findViewById<ImageView>(R.id.badge1_edit_badge) to "badge0",
                    view.findViewById<ImageView>(R.id.badge2_edit_badge) to "badge1",
                    view.findViewById<ImageView>(R.id.badge3_edit_badge) to "badge2",
                    view.findViewById<ImageView>(R.id.badge4_edit_badge) to "badge3",
                    view.findViewById<ImageView>(R.id.badge5_edit_badge) to "badge4",
                    view.findViewById<ImageView>(R.id.badge6_edit_badge) to "badge5",
                    view.findViewById<ImageView>(R.id.badge7_edit_badge) to "badge6",
                    view.findViewById<ImageView>(R.id.badge8_edit_badge) to "badge7",
                    view.findViewById<ImageView>(R.id.badge9_edit_badge) to "badge8",
                    view.findViewById<ImageView>(R.id.badge10_edit_badge) to "badge9",
                    view.findViewById<ImageView>(R.id.badge11_edit_badge) to "badge10",
                    view.findViewById<ImageView>(R.id.badge12_edit_badge) to "badge11",
                    view.findViewById<ImageView>(R.id.badge13_edit_badge) to "badge12",
                    view.findViewById<ImageView>(R.id.badge14_edit_badge) to "badge13",
                    view.findViewById<ImageView>(R.id.badge15_edit_badge) to "badge14",
                    view.findViewById<ImageView>(R.id.badge16_edit_badge) to "badge15",
                    view.findViewById<ImageView>(R.id.badge17_edit_badge) to "badge16",
                    view.findViewById<ImageView>(R.id.badge18_edit_badge) to "badge17",
                    view.findViewById<ImageView>(R.id.badge19_edit_badge) to "badge18",
                    view.findViewById<ImageView>(R.id.badge20_edit_badge) to "badge19")

            // Initialize a new instance of popup window
            val popupWindow = PopupWindow(view, ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, true)
            createPopUpWindowTransitions(popupWindow)

            // Afficher le badge du joueur dans la popup window
            val newBadge = view.findViewById<ImageView>(R.id.user_badge_edit_badge)
            newBadge.setImageDrawable(userBadgeProfile.drawable)

            setBadgesOnClickListeners(view, badges)

            val okButton = view.findViewById<Button>(R.id.ok_badge_button)
            val cancelButton = view.findViewById<Button>(R.id.cancel_badge_button)
            setButtonsOnClickListener(popupWindow, okButton, cancelButton, newBadge, userBadgeProfile, ImageType.BADGE)

            // Finally, show the popup window on app
            TransitionManager.beginDelayedTransition(edit_profile_layout)
            popupWindow.showAtLocation(
                    edit_profile_layout, // Location to display popup window
                    Gravity.CENTER, // Exact position of layout to display popup
                    0, // X offset
                    0 // Y offset
            )
        }
    }

    private fun setButtonsOnClickListener(popupWindow: PopupWindow, okButton: Button, cancelButton: Button, newImage: ImageView, imageProfile: ImageView, imageType: ImageType){

        okButton.setOnClickListener{
            popupWindow.dismiss()
            imageProfile.setImageDrawable(newImage.drawable)
            if(imageType == ImageType.AVATAR) {
                ServerRequest().setAvatar(newImage.tag.toString())
            }
            else {
                ServerRequest().setSelectedBadges(currentBadges)
            }
        }
        cancelButton.setOnClickListener{
            popupWindow.dismiss()
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

    private fun setAvatarsOnClickListeners(view: View, avatars: Map<ImageView, String>) {
        val userAvatar = view.findViewById<ImageView>(R.id.user_avatar_edit_avatar)

        ServerRequest().getUnlockedAvatar(object : MyCallBackStringArray{
            override fun onCallBack(value: ArrayList<String>) {
                for(avatar in avatars.keys) {
                    avatar.tag = avatars[avatar]
                    if (value.contains(avatars[avatar])) {
                        setUnlockedAvatarOnClickListener(view, avatar, avatars.keys)
                        if(avatar.drawable.constantState == userAvatar.drawable.constantState) {
                            // Highlight l'avatar du joueur dans les choix
                            avatar.setBackgroundResource(R.drawable.highlight_blue)
                            userAvatar.tag = avatar.tag
                        }
                    }
                    else {
                        setLocked(avatar, false)
                        setNotAvailableOnClickListener(avatar, "Use the Web version of the game to buy this avatar!")
                    }
                }
            }
        })
    }

    private fun setBadgesOnClickListeners(view: View, badges: Map<ImageView, String>){
        val userBadge = view.findViewById<ImageView>(R.id.user_badge_edit_badge)

        for(badge in badges.keys) {
            badge.tag = badges[badge]
            if (badge.drawable.constantState == badge1_edit_profile.drawable.constantState || badge.drawable.constantState == badge2_edit_profile.drawable.constantState || badge.drawable.constantState == badge3_edit_profile.drawable.constantState) {
                if(badge.drawable.constantState == userBadge.drawable.constantState) {
                    setUnlockedBadgeOnClickListener(view, badge, badges.keys, currentBadges)
                    // Highlight le badge du joueur dans les choix
                    badge.setBackgroundResource(R.drawable.highlight_blue)
                    userBadge.tag = badge.tag
                }
                else {
                    badge.setBackgroundResource(R.drawable.highlight_black)
                }
            }
            else if(unlockedBadges.contains(badges[badge])){
                setUnlockedBadgeOnClickListener(view, badge, badges.keys, currentBadges)
            }
            else {
                setLocked(badge, false)
                setNotAvailableOnClickListener(badge, "You have not unlocked this badge yet") // Message comme quoi il n'est pas débloqué ?
            }
        }
    }

    private fun setBadgesProfile(){
        setImageDrawableWithName("ic_" + currentBadges[0], badge1_edit_profile)
        setImageDrawableWithName("ic_" + currentBadges[1], badge2_edit_profile)
        setImageDrawableWithName("ic_" + currentBadges[2], badge3_edit_profile)
    }

    private fun setNotAvailableOnClickListener(avatar: ImageView, message: String){
        avatar.setOnClickListener{
            showMessage(message)
        }
    }

    private fun setUnlockedAvatarOnClickListener(view: View, avatar: ImageView, avatarsImageView: Set<ImageView>){
        val userAvatar = view.findViewById<ImageView>(R.id.user_avatar_edit_avatar)
        avatar.setOnClickListener{
            userAvatar.setImageDrawable(avatar.drawable)
            removeAllHighlight(avatarsImageView)
            avatar.setBackgroundResource(R.drawable.highlight_blue)
            userAvatar.tag = avatar.tag
        }
    }

    private fun setUnlockedBadgeOnClickListener(view: View, badge: ImageView, badgesImageView: Set<ImageView>, currentBadges: ArrayList<String>){
        val userBadge = view.findViewById<ImageView>(R.id.user_badge_edit_badge)
        badge.setOnClickListener{
            // Changer l'image
            userBadge.setImageDrawable(badge.drawable)
            userBadge.tag = badge.tag
            // Retirer le bleu de l'ancien
            replaceBadgeInCurrentBadges(badgesImageView, currentBadges, badge.tag.toString())
            // Mettre le bleu sur le nouveau
            badge.setBackgroundResource(R.drawable.highlight_blue)
        }
    }

    private fun replaceBadgeInCurrentBadges(badgesImageView: Set<ImageView>, currentBadges: ArrayList<String>, newBadge: String){
        for(badge in badgesImageView) {
            // Si c'est l'ancien badge sélectionné
            if(badge.background.constantState == ContextCompat.getDrawable(this, R.drawable.highlight_blue)?.constantState){
                badge.setBackgroundResource(R.drawable.white_round_border)
                currentBadges[currentBadges.indexOf(badge.tag.toString())] = newBadge
            }
        }
    }

    private fun removeAllHighlight(avatarsImageView: Set<ImageView>){
        for(avatar in avatarsImageView) {
            avatar.setBackgroundResource(R.drawable.white_round_border)
        }
    }

    private fun setLocked(v: ImageView, editBackground: Boolean) {
        val matrix = ColorMatrix()
        matrix.setSaturation(0f) //0 means grayscale
        val cf = ColorMatrixColorFilter(matrix)
        v.colorFilter = cf
        v.imageAlpha = 128 // 128 = 0.5
        if(editBackground){
            v.background.colorFilter = cf
            v.background.alpha = 220
        }
    }

    private fun showMessage(message: String?) {
        val root = findViewById<View>(android.R.id.content)
        val toast = Toast.makeText(this, message, Toast.LENGTH_SHORT)
        val yOffset = 0.coerceAtLeast(root.height - toast.yOffset + 20)
        toast.setGravity(Gravity.TOP or Gravity.CENTER_HORIZONTAL, 0, yOffset)
        toast.show()
    }

    // *************************** Chat popup *****************************************
    private fun chatPopUp(inflater: LayoutInflater) {
        chat_button_popup_edit_profile.setOnClickListener {
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
            TransitionManager.beginDelayedTransition(edit_profile_layout)
            popupWindow.showAtLocation(
                    edit_profile_layout,
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
                val adapter: ArrayAdapter<String> = object: ArrayAdapter<String>(baseContext, R.layout.spinner_layout, list){
                    override fun getDropDownView(
                            position: Int,
                            convertView: View?,
                            parent: ViewGroup
                    ): View {
                        val viewSpinner: TextView = super.getDropDownView(position, convertView, parent) as TextView
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
        notification_popup_edit_profile.visibility = View.VISIBLE
    }

    private fun hideNotification(){
        notification_popup_edit_profile.visibility = View.GONE
    }

    //************************ Music ***********************************
    private fun setMusic(){
        mediaPlayerMusic =  MediaPlayer.create(this, R.raw.dancing_dog_music)
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