package com.example.polydessinmobile

import android.content.Context
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import kotlinx.android.synthetic.main.player_card_item.view.*

class PlayerCardAdapter(private val playersList: List<PlayerGameItem>) :
        RecyclerView.Adapter<PlayerCardAdapter.PlayersViewHolder>() {
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PlayersViewHolder {
        val itemView = LayoutInflater.from(parent.context).inflate(R.layout.player_card_item,
                parent, false)
        return PlayersViewHolder(itemView)
    }
    override fun onBindViewHolder(holder: PlayersViewHolder, position: Int) {
        val currentItem = playersList[position]
        holder.playerUsername.text = currentItem.playerUsername
        setImageDrawableWithName(currentItem.playerAvatar, holder.playerAvatar)
        setImageDrawableWithName("ic_" + currentItem.playerBadge1, holder.playerBadge1)
        setImageDrawableWithName("ic_" + currentItem.playerBadge2, holder.playerBadge2)
        setImageDrawableWithName("ic_" + currentItem.playerBadge3, holder.playerBadge3)
        holder.playerScore.text = currentItem.playerScore.toString() + " points"
        holder.playerRole.text = currentItem.playerRole
        if(currentItem.playerTeam == "teamA") holder.playerTeam.setBackgroundResource(R.color.red_team)
        else if(currentItem.playerTeam == "teamB") holder.playerTeam.setBackgroundResource(R.color.blue_team)
        else {
            holder.playerTeam.visibility = View.GONE
            if(currentItem.playerUsername.contains("[Robot]")) holder.playerScore.visibility = View.GONE
        }
        if(currentItem.playerUsername.contains("[Robot]")) holder.playerPersonality.text = currentItem.personality
    }
    override fun getItemCount() = playersList.size
    class PlayersViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val playerAvatar: ImageView = itemView.player_avatar
        val playerUsername: TextView = itemView.player_username
        val playerBadge1: ImageView = itemView.player_badge1
        val playerBadge2: ImageView = itemView.player_badge2
        val playerBadge3: ImageView = itemView.player_badge3
        val playerScore: TextView = itemView.player_score
        val playerRole: TextView = itemView.player_role
        val playerTeam: ImageView = itemView.player_team
        val playerPersonality: TextView = itemView.personality
    }

    private fun setImageDrawableWithName(drawableName: String, imageView: ImageView){
        val context: Context = imageView.context
        val id: Int = context.resources.getIdentifier(drawableName, "drawable", context.packageName)
        imageView.setImageResource(id)
    }
}