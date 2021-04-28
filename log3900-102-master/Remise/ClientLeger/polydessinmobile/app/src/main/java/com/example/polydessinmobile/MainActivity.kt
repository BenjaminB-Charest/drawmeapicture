package com.example.polydessinmobile

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.Gravity
import android.view.KeyEvent
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import kotlinx.android.synthetic.main.activity_main.*
import kotlinx.android.synthetic.main.activity_main.login_button_login
import kotlinx.android.synthetic.main.activity_sign_up.*
import java.util.*
import kotlin.collections.ArrayList

class MainActivity : AppCompatActivity() {
    private lateinit var auth: FirebaseAuth

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        auth = Firebase.auth

        ServerRequest().initListener()

        setContentView(R.layout.activity_main)

        login_button_login.setOnClickListener {
            tryToLogin()
        }

        username_edittext_login.setOnKeyListener(View.OnKeyListener { v, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_UP) {
                tryToLogin()
                return@OnKeyListener true
            }
            false
        })

        passwordLogin.setOnKeyListener(View.OnKeyListener { _, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_UP) {
                tryToLogin()
                return@OnKeyListener true
            }
            false
        })

    }

    override fun onStart() {
        super.onStart()
        if(auth.currentUser != null) {
            ServerRequest().getIsLoggin(object : MyCallBackBool {
                override fun onCallBack(value: Boolean) {
                    if (!value) goToMainMenu()
                }
            })
        }
    }

    fun goToMainMenu() {
        if (isFirstOnStart) {
            loginDate = Date()
            ServerRequest().addLoginHistory()
            ServerRequest().getChannelsShareKeyUser(object : MyCallBackStringArray{
                override fun onCallBack(value: ArrayList<String>) {
                    for (v in value) shareKeysUser.add(v)
                    isViewChannel.clear()
                    ServerRequest().getMessageNotification(value)
                }
            })
        }
        startActivity(Intent(this, MainMenuActivity::class.java))
        finish()
    }

    fun goToSignUp(view: View) {
        startActivity(Intent(this, SignUpActivity::class.java))
        finish()
    }

    private fun tryToLogin() {
        val email = username_edittext_login.text.toString() + "@DrawMeAPicturePolyMTL.com"
        val password = passwordLogin.text.toString()

        ServerRequest().getLoginIsLoggin(object : MyCallBackBool {
            override fun onCallBack(value: Boolean) {
                if (loginFieldsFilled() && !value) { // Si les champs sont remplis, vérifier si les infos sont bonnes
                    auth.signInWithEmailAndPassword(email, password).addOnCompleteListener { task ->
                        if (task.isSuccessful) {
                            goToMainMenu()
                        } else {
                            showMessage(task.exception?.localizedMessage?.replace("The user may have been deleted.", "")?.replace(" or the user does not have a password", ""))
                        }
                    }
                } else showMessage("The user is already connected")
            }
        }, username_edittext_login.text.toString())
    }

    private fun showMessage(message: String?) {
        val toast = Toast.makeText(this, message, Toast.LENGTH_SHORT)
        toast.setGravity(Gravity.NO_GRAVITY, 0, 300)
        toast.show()
    }

    private fun loginFieldsFilled() : Boolean{
        val presentUsername = username_edittext_login.text.toString()
        val password = passwordLogin.text.toString()

        if (presentUsername.isBlank() && password.isBlank()) showMessage("Please fill the fields")
        else if (presentUsername.isBlank()) showMessage("Please enter your username")
        else if (password.isBlank()) showMessage("Please enter your password")
        else return true
        return false
    }
}