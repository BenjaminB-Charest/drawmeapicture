package com.example.polydessinmobile

import android.app.Dialog
import android.content.Context
import android.graphics.drawable.ColorDrawable
import android.content.Intent
import android.media.MediaPlayer
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.text.method.ScrollingMovementMethod
import android.transition.Slide
import android.transition.TransitionManager
import android.util.TypedValue
import android.view.*
import android.widget.*
import androidx.core.content.ContextCompat
import androidx.core.view.setPadding
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.firebase.firestore.FieldValue
import com.google.firebase.auth.ktx.auth
import com.google.firebase.ktx.Firebase
import kotlinx.android.synthetic.main.activity_game_history.*
import kotlinx.android.synthetic.main.activity_leaderboard.*
import kotlinx.android.synthetic.main.activity_login_history.*
import kotlinx.android.synthetic.main.confirm_quit_channel.*
import java.text.SimpleDateFormat

class LoginHistoryActivity : AppCompatActivity() {

    private lateinit var mediaPlayerMusicReceiveMessage: MediaPlayer
    private var isFirstNewPage = true

    // Chat
    lateinit var chatBox: TextView
    private var shareKey = "ABCDEF"
    private var isJoining = true


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login_history)

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

        title = "Login History"
        val theThis = this

        ServerRequest().getLoginHistory(object : MyCallBackLoginHistoryList{
            override fun onCallBack(value: MutableList<LoginHistoryItem>) {
                recycler_view_login.adapter = LoginHistoryAdapter(value) // Prend en param??tre un List<LoginHistoryItem>
                recycler_view_login.layoutManager = LinearLayoutManager(theThis)
                recycler_view_login.setHasFixedSize(true)
            }
        })

        //************************ Pop up **********************************
        // Initialize a new layout inflater instance of chat popup
        val inflater: LayoutInflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        chatPopUp(inflater)

        mediaPlayerMusicReceiveMessage = MediaPlayer.create(this, R.raw.receive_message)

        ServerRequest().listenToNewMessage(object : MyCallBackInt {
            override fun onCallBack(value: Int) {
                if(value != 0 && !isFirstNewPage) mediaPlayerMusicReceiveMessage.start()
                isFirstNewPage = true
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
        ServerRequest().destroyListenerMessages()
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        when (item.itemId) {
            android.R.id.home -> {
                onBackPressed()
                return true
            }
        }
        return super.onOptionsItemSelected(item)
    }

    // *************************** Chat popup *****************************************
    private fun chatPopUp(inflater: LayoutInflater) {
        chat_button_popup_login_history.setOnClickListener {
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
            TransitionManager.beginDelayedTransition(activity_login_history)
            popupWindow.showAtLocation(
                    activity_login_history,
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
                // TODO : Trouver l'index du nouveau channel dans la liste de channels et le d??finir comme actif

                //channelDropDown.setSelection(2)
            }
            else showMessage("Please the share key of the channel you want to join.")
        }
        else{
            if(channelNameField.text.isNotEmpty()){
                val channelDropDown = view.findViewById<Spinner>(R.id.channel_drop_down_popup)
                // TODO : Trouver l'index du nouveau channel dans la liste de channels et le d??finir comme actif

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
        notification_popup_login_history.visibility = View.VISIBLE
    }

    private fun hideNotification(){
        notification_popup_login_history.visibility = View.GONE
    }

    private fun showMessage(message: String?) {
        val root = findViewById<View>(android.R.id.content)
        val toast = Toast.makeText(this, message, Toast.LENGTH_SHORT)
        val yOffset = 0.coerceAtLeast(root.height - toast.yOffset + 20)
        toast.setGravity(Gravity.TOP or Gravity.CENTER_HORIZONTAL, 0, yOffset)
        toast.show()
    }
}