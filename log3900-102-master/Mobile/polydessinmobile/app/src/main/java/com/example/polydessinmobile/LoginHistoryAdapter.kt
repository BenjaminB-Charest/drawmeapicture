package com.example.polydessinmobile

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import kotlinx.android.synthetic.main.game_history_item.view.*
import kotlinx.android.synthetic.main.login_history_item.view.*

open class LoginHistoryAdapter(private val loginList: List<LoginHistoryItem>) :
    RecyclerView.Adapter<LoginHistoryAdapter.LoginViewHolder>() {
        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): LoginViewHolder {
            val itemView = LayoutInflater.from(parent.context).inflate(R.layout.login_history_item,
                parent, false)
            return LoginViewHolder(itemView)
        }
        override fun onBindViewHolder(holder: LoginViewHolder, position: Int) {
            val currentItem = loginList[position]
            if(currentItem.connectionType){
                holder.connectionType.text = "Connected :  "
                holder.connectionLogo.setImageResource(R.drawable.ic_login)
            }
            else{
                holder.connectionType.text = "Disconnected :  "
                holder.connectionLogo.setImageResource(R.drawable.ic_logout)
            }
            holder.loginDate.text = currentItem.date
        }
        override fun getItemCount() = loginList.size
        class LoginViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            val connectionLogo: ImageView = itemView.connection_logo
            val connectionType: TextView = itemView.connection_bool
            val loginDate: TextView = itemView.login_date
        }
    }