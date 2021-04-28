package com.example.polydessinmobile

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import kotlinx.android.synthetic.main.join_game_item.view.*

class JoinGameAdapter(private val gameList: List<JoinGameItem>) :
    RecyclerView.Adapter<JoinGameAdapter.GameViewHolder>() {
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GameViewHolder {
        val itemView = LayoutInflater.from(parent.context).inflate(R.layout.join_game_item,
            parent, false)
        return GameViewHolder(itemView)
    }
    override fun onBindViewHolder(holder: GameViewHolder, position: Int) {
        val currentItem = gameList[position]
        for(player in currentItem.players){
            when(player.value){
                0 -> {
                    holder.player2Username.text = player.key
                    ServerRequest().getAvatarUser(object : MyCallBackString{
                        override fun onCallBack(value: String) {
                            setImageDrawableWithName(value, holder.player2Avatar)
                        }
                    }, player.key)
                }
                1 -> {
                    holder.player4Username.text = player.key
                    ServerRequest().getAvatarUser(object : MyCallBackString{
                        override fun onCallBack(value: String) {
                            setImageDrawableWithName(value, holder.player4Avatar)
                        }
                    }, player.key)
                }
                2 -> {
                    holder.player1Username.text = player.key
                    ServerRequest().getAvatarUser(object : MyCallBackString{
                        override fun onCallBack(value: String) {
                            setImageDrawableWithName(value, holder.player1Avatar)
                        }
                    }, player.key)
                }
                3 -> {
                    holder.player3Username.text = player.key
                    ServerRequest().getAvatarUser(object : MyCallBackString{
                        override fun onCallBack(value: String) {
                            setImageDrawableWithName(value, holder.player3Avatar)
                        }
                    }, player.key)
                }
            }
        }
        holder.gameName.text = currentItem.name
        if(currentItem.isPublic) {
            holder.joinButton.visibility = View.VISIBLE
            holder.joinButton.setOnClickListener {
                ServerRequest().setLobbyPlayer(currentItem.id, ServerRequest().getUsernameEmail(), getPlayerIndex(currentItem.players.values))
                val intent = Intent(holder.joinButton.context, LobbyActivity::class.java)
                intent.putExtra("lobbyId", currentItem.id)
                holder.gameName.context.startActivity(intent)
               val test = holder.gameName.context as Activity
                test.finish()
            }
        }
    }

    override fun getItemCount() = gameList.size
    class GameViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val player1Username: TextView = itemView.player1_username_join
        val player2Username: TextView = itemView.player2_username_join
        val player3Username: TextView = itemView.player3_username_join
        val player4Username: TextView = itemView.player4_username_join
        val player1Avatar: ImageView = itemView.player1_avatar_join
        val player2Avatar: ImageView = itemView.player2_avatar_join
        val player3Avatar: ImageView = itemView.player3_avatar_join
        val player4Avatar: ImageView = itemView.player4_avatar_join
        val gameName: TextView = itemView.game_name_join
        val joinButton: Button = itemView.join_game_button
    }

    private fun setImageDrawableWithName(drawableName: String, imageView: ImageView){
        val context: Context = imageView.context
        val id: Int = context.resources.getIdentifier(drawableName, "drawable", context.packageName)
        imageView.setImageResource(id)
    }

    private fun getPlayerIndex(usedIndexes: Collection<Int>): Int{
        if(!usedIndexes.contains(3)) return 3
        else if (!usedIndexes.contains(0)) return 0
        else return 1
    }
}