package com.example.polydessinmobile

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.core.view.setPadding
import androidx.recyclerview.widget.RecyclerView
import kotlinx.android.synthetic.main.game_history_item.view.*
class GameHistoryAdapter(private val gameList: List<GameHistoryItem>) :
    RecyclerView.Adapter<GameHistoryAdapter.GameViewHolder>() {
        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GameViewHolder {
            val itemView = LayoutInflater.from(parent.context).inflate(R.layout.game_history_item,
                parent, false)
            return GameViewHolder(itemView)
        }
        override fun onBindViewHolder(holder: GameViewHolder, position: Int) {
            val currentItem = gameList[position]
            holder.gameMode.text = currentItem.gameMode
            holder.gameDate.text = currentItem.date
            var playersText = ""
            for(player in currentItem.players){
                if(currentItem.players.indexOf(player) == 0) playersText = player
                else if(currentItem.players.indexOf(player) == 2) playersText = playersText + ",\n" + player
                else playersText = "$playersText, $player"
            }
            holder.gamePlayers.text = playersText
            when (currentItem.finalPosition) {
                0 -> holder.gamePosition.setImageResource(R.drawable.ic_solo_award)
                1 -> holder.gamePosition.setImageResource(R.drawable.ic_first)
                2 -> holder.gamePosition.setImageResource(R.drawable.ic_second)
                3 -> holder.gamePosition.setImageResource(R.drawable.ic_third)
                4 -> {
                    holder.gamePosition.setImageResource(R.drawable.ic_four)
                    holder.gamePosition.setPadding(20, 20, 20, 20)
                }
                else -> holder.gamePosition.setImageResource(0)
            }
            holder.gameFinalScore.text = currentItem.finalScore.toString() + " points"
            holder.gameTime.text = currentItem.gameTime
        }
        override fun getItemCount() = gameList.size
        class GameViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            val gameMode: TextView = itemView.game_mode_value
            val gameDate: TextView = itemView.game_date_value
            val gamePlayers: TextView = itemView.game_players_value
            val gamePosition: ImageView = itemView.position_icon
            val gameFinalScore: TextView = itemView.game_final_score_value
            val gameTime: TextView = itemView.game_time_value
        }
    }