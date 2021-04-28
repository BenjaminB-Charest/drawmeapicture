package com.example.polydessinmobile

import android.content.Intent
import android.os.Bundle
import android.view.Gravity
import android.view.KeyEvent
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import kotlinx.android.synthetic.main.activity_join_lobby.*
import kotlinx.android.synthetic.main.activity_sign_up.*
import java.util.*

class SignUpActivity : AppCompatActivity() {
    private val documentUsers = Firebase.firestore.collection("userProfile")
    private lateinit var auth: FirebaseAuth
    var avatar = "male"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_sign_up)

        title = "Sign Up"

        auth = Firebase.auth

        signUp_button.setOnClickListener {
            tryToSignUp()
        }

        editTextFirstName.setOnKeyListener(View.OnKeyListener { _, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_UP) {
                tryToSignUp()
            }
            false
        })

        editTextLastName.setOnKeyListener(View.OnKeyListener { _, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_UP) {
                tryToSignUp()
            }
            false
        })

        username_edittext_signup.setOnKeyListener(View.OnKeyListener { _, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_UP) {
                tryToSignUp()
            }
            false
        })

        editTextPassword.setOnKeyListener(View.OnKeyListener { _, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_UP) {
                tryToSignUp()
            }
            false
        })

        editTextConfirmPassword.setOnKeyListener(View.OnKeyListener { _, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_UP) {
                tryToSignUp()
            }
            false
        })

        val drawable1 = resources.getDrawable(R.drawable.male, theme)
        avatar1.setImageDrawable(drawable1)

        val drawable2 = resources.getDrawable(R.drawable.girl, theme)
        avatar2.setImageDrawable(drawable2)

        avatar1.setOnClickListener() {
            avatar1.setBackgroundResource(R.drawable.highlight_yellow)
            avatar2.setBackgroundResource(0)
            avatar = "male"
        }

        avatar2.setOnClickListener() {
            avatar2.setBackgroundResource(R.drawable.highlight_yellow)
            avatar1.setBackgroundResource(0)
            avatar = "girl"
        }
    }

    private fun tryToSignUp(){
        val username = username_edittext_signup.text.toString()

        // Vérifier que tous les champs sont remplis correctement
        if (signUpFieldsFilledCorrectly()) { // Si tous les champs sont bien remplis, vérifier username pas déjà utilisé
            auth.createUserWithEmailAndPassword("$username@DrawMeAPicturePolyMTL.com".toLowerCase(), editTextPassword.text.toString()).addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    isViewChannel.put("ABCDEF", true)
                    documentUsers.document(username).set(hashMapOf(
                        "avatar" to avatar.toLowerCase(),
                        "firstName" to editTextFirstName.text.toString(),
                        "lastName" to editTextLastName.text.toString(),
                        "isLoggedIn" to false,
                        "experience" to 0,
                        "unlockedAvatars" to arrayListOf("male", "girl"),
                        "toggleVP" to true,
                        "toggleMusic" to true,
                        "channels" to arrayListOf("ABCDEF"),
                        "money" to 0,
                        "selectedBadges" to arrayListOf("noBadge", "noBadge", "noBadge"),
                        "unlockedBadges" to arrayListOf<String>()
                    ))
                    goToMainMenu()
                } else {
                    showMessage(task.exception?.localizedMessage?.replace("email address", "username"))
                }
            }
        }
    }

    /** Called when the user taps the logIn button */
    fun logIn(view: View) {
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }

    private fun goToMainMenu() {
        ServerRequest().addLoginHistory()
        loginDate = Date()
        val intent = Intent(this,MainMenuActivity::class.java)
        intent.putExtra("isTutorial","true")
        startActivity(intent)

        //startActivity(Intent(this, MainMenuActivity::class.java))
        finish()
    }

    private fun showMessage(message: String?) {
        val root = findViewById<View>(android.R.id.content)
        val toast = Toast.makeText(this, message, Toast.LENGTH_SHORT)
        val yOffset = 0.coerceAtLeast(root.height - toast.yOffset + 20)
        toast.setGravity(Gravity.TOP or Gravity.CENTER_HORIZONTAL, 0, yOffset)
        toast.show()
    }

    private fun signUpFieldsFilledCorrectly(): Boolean {
        val firstName = editTextFirstName.text.toString()
        val lastName = editTextLastName.text.toString()
        val presentUsername = username_edittext_signup.text.toString()
        val password = editTextPassword.text.toString()
        val confirmPassword = editTextConfirmPassword.text.toString()

        if (presentUsername.isBlank() || firstName.isBlank() || lastName.isBlank() || password.isBlank() || confirmPassword.isBlank()) showMessage("Please fill all the fields")
        else if(firstName.length > 20) showMessage("The first name you entered exceeds 20 characters")
        else if(lastName.length > 20) showMessage("The last name you entered exceeds 20 characters")
        else if(presentUsername.length > 12) showMessage("The username you entered exceeds 12 characters")
        else if(password.length < 6) showMessage("The password must be at least 6 characters")
        else if(password.contains(" ")) showMessage("The password can't contain whitespaces")
        else if(password != confirmPassword) showMessage("The password confirmation is not correct")
        else return true
        return false
    }

}