package com.example.polydessinmobile

import android.content.Context
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.core.view.setPadding
import androidx.recyclerview.widget.RecyclerView
import kotlinx.android.synthetic.main.game_history_item.view.*
import kotlinx.android.synthetic.main.player_card_item.view.*
import kotlinx.android.synthetic.main.player_end_game_item.view.*

class PlayerEndAdapter(private val playersList: List<PlayerGameItem>) :
        RecyclerView.Adapter<PlayerEndAdapter.PlayersViewHolder>() {
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PlayersViewHolder {
        val itemView = LayoutInflater.from(parent.context).inflate(R.layout.player_end_game_item,
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
        when (playersList.indexOf(currentItem)) {
            0 -> holder.playerPosition.setImageResource(R.drawable.ic_first)
            1 -> {
                if(currentItem.playerScore < playersList[position - 1].playerScore) holder.playerPosition.setImageResource(R.drawable.ic_second)
                else holder.playerPosition.setImageResource(R.drawable.ic_first)
            }
            2 -> {
                if(currentItem.playerScore < playersList[position - 1].playerScore) holder.playerPosition.setImageResource(R.drawable.ic_third)
                else if(currentItem.playerScore < playersList[position - 2].playerScore) holder.playerPosition.setImageResource(R.drawable.ic_second)
                else holder.playerPosition.setImageResource(R.drawable.ic_first)
            }
            3 -> {
                if(currentItem.playerScore < playersList[position - 1].playerScore) holder.playerPosition.setImageResource(R.drawable.ic_four)
                else if(currentItem.playerScore < playersList[position - 2].playerScore) holder.playerPosition.setImageResource(R.drawable.ic_third)
                else if(currentItem.playerScore < playersList[position - 3].playerScore) holder.playerPosition.setImageResource(R.drawable.ic_second)
                else holder.playerPosition.setImageResource(R.drawable.ic_first)
            }
        }
        if(currentItem.playerTeam == "teamA") {
            holder.playerTeam.setBackgroundResource(R.color.red_team)
        }
        else {
            holder.playerTeam.setBackgroundResource(R.color.blue_team)
        }
    }
    override fun getItemCount() = playersList.size
    class PlayersViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val playerAvatar: ImageView = itemView.player_avatar_final
        val playerUsername: TextView = itemView.player_username_final
        val playerBadge1: ImageView = itemView.player_badge1_final
        val playerBadge2: ImageView = itemView.player_badge2_final
        val playerBadge3: ImageView = itemView.player_badge3_final
        val playerScore: TextView = itemView.player_score_final
        val playerPosition: ImageView = itemView.player_position_final
        val playerTeam: ImageView = itemView.player_team_final
    }

    private fun setImageDrawableWithName(drawableName: String, imageView: ImageView){
        val context: Context = imageView.context
        val id: Int = context.resources.getIdentifier(drawableName, "drawable", context.packageName)
        imageView.setImageResource(id)
    }
}