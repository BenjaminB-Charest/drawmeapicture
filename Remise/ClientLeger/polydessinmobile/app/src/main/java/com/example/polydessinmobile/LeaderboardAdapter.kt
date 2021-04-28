package com.example.polydessinmobile

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.RelativeLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import kotlinx.android.synthetic.main.leaderboard_item.view.*

class LeaderboardAdapter(private val playersList: List<PlayerLeaderboardItem>) :
    RecyclerView.Adapter<LeaderboardAdapter.LeaderboardViewHolder>() {
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): LeaderboardViewHolder {
        val itemView = LayoutInflater.from(parent.context).inflate(R.layout.leaderboard_item,
            parent, false)
        return LeaderboardViewHolder(itemView)
    }
    override fun onBindViewHolder(holder: LeaderboardViewHolder, position: Int) {
        val currentItem = playersList[position]
        holder.playerUsername.text = currentItem.playerUsername
        ServerRequest().getAvatarUser(object : MyCallBackString{
            override fun onCallBack(value: String) {
                setImageDrawableWithName(value, holder.playerAvatar)
            }
        }, currentItem.playerUsername)
        holder.playerScore.text = currentItem.playerScore.toString() + " points"
        holder.playerPosition.text = "#" + currentItem.playerPosition
        if(currentItem.playerUsername == ServerRequest().getUsernameEmail()) holder.playerContainer.setBackgroundResource(R.color.colorPrimaryMedium)
    }
    override fun getItemCount() = playersList.size
    class LeaderboardViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val playerAvatar: ImageView = itemView.player_avatar_leaderboard
        val playerUsername: TextView = itemView.player_username_leaderboard
        val playerScore: TextView = itemView.player_score_leaderboard
        val playerPosition: TextView = itemView.position_leaderboard
        val playerContainer: RelativeLayout = itemView.player_container_leaderboard
    }

    private fun setImageDrawableWithName(drawableName: String, imageView: ImageView){
        val context: Context = imageView.context
        val id: Int = context.resources.getIdentifier(drawableName, "drawable", context.packageName)
        imageView.setImageResource(id)
    }
}