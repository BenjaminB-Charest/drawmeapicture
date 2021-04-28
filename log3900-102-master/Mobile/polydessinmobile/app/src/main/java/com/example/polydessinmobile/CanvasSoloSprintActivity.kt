package com.example.polydessinmobile

import android.annotation.SuppressLint
import android.graphics.*
import android.os.Bundle
import android.os.Handler
import android.util.Log
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.slider.Slider
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import kotlinx.android.synthetic.main.activity_multiplayer_drawing.*
import kotlinx.android.synthetic.main.activity_multiplayer_drawing.canvasImageView
import kotlinx.android.synthetic.main.activity_sprint_solo.*
import yuku.ambilwarna.AmbilWarnaDialog
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

open class CanvasSoloSprintActivity: AppCompatActivity(){
    // Grid
    open var strokes = mutableListOf<Stroke>()

    // Code Canvas
    open var bitmap: Bitmap? = null
    open var canvas: Canvas? = null
    open var paint: Paint? = null
    open val path: Path = Path()
    open var widthDisplay = 1154
    open var heightDisplay = 675

    open var runnables = mutableListOf<Runnable>()
    open var handler = Handler()
    open var timeRemainingDraw: Long = 0
    open var timePerPoint: Long = 0

    @ExperimentalStdlibApi
    @SuppressLint("ClickableViewAccessibility")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_sprint_solo)
        createCanvas()
    }

    // DRAWER
    @ExperimentalStdlibApi
    open fun setDrawingTools() {
        ask_hint_button.visibility = View.GONE
        ask_hints_left.visibility = View.GONE

        // Pencil
        activatePencil()
    }


    // CANVAS
    open fun createCanvas(){
        canvas_image_view_solo.setImageResource(R.drawable.ic_arrow_right)
        bitmap = Bitmap.createBitmap(widthDisplay, heightDisplay, Bitmap.Config.ARGB_8888)
        canvas = Canvas(bitmap!!)
        canvas_image_view_solo.setImageBitmap(bitmap)
        paint = Paint()
        canvas_image_view_solo.setBackgroundColor(Color.WHITE)
        activatePencil()
    }

    // PENCIL
   open fun activatePencil(){
        paint!!.strokeCap = Paint.Cap.ROUND
        paint!!.style = Paint.Style.FILL_AND_STROKE
    }

    open fun drawImageRobot(imageId: String, difficulty: String) {
        ServerRequest().getStrokeRobot(object : MyCallBackCanvasActionList {
            override fun onCallBack(value: MutableList<canvasAction>) {
                timeRemainingDraw = 0
                runnables.clear()
                var totalTime: Long = 0
                when (difficulty) {
                    "easy" -> totalTime = 15000
                    "normal" -> totalTime = 20000
                    "hard" -> totalTime = 25000
                }
                var nbPoints = 0
                for (v in value) {
                    nbPoints += v.stroke.pathPencil.size
                }
                timePerPoint = totalTime / nbPoints
                var time: Long = 0
                for (v in value) {
                    var count = 0
                    var oldPoint = Vec2(v.stroke.pathPencil[0].x, v.stroke.pathPencil[0].y)
                    if (v.stroke.pathPencil.size == 1) {
                        drawCircleTimer(oldPoint, time, v.stroke.pencilOpacity, v.stroke.pencilColor, v.stroke.pencilSize)
                        time += timePerPoint
                    }
                    while (count < (v.stroke.pathPencil.size - 1)){
                        drawLineTimer(oldPoint, v.stroke.pathPencil[count], time, v.stroke.pencilOpacity, v.stroke.pencilColor, v.stroke.pencilSize)
                        drawCircleTimer(oldPoint, time, v.stroke.pencilOpacity, v.stroke.pencilColor, v.stroke.pencilSize)
                        oldPoint = Vec2(v.stroke.pathPencil[count].x, v.stroke.pathPencil[count].y)
                        count++
                        time += timePerPoint
                    }
                }
            }
        }, Firebase.firestore.collection("drawings-library").document(imageId))
    }

    open fun drawLineTimer(firstPoint: Vec2, secondPoint: Vec2, time: Long, opacity: Int, color: Int, size: Float) {
        runnables.add(Runnable  {
            paint!!.color = Color.argb(opacity, Color.red(color), Color.green(color), Color.blue(color))
            paint!!.strokeWidth = size
            canvas?.drawLine(firstPoint.x, firstPoint.y, secondPoint.x, secondPoint.y, paint as Paint)
            if(firstPoint.x == secondPoint.x && firstPoint.y == secondPoint.y) {
                paint!!.style = Paint.Style.FILL
                canvas?.drawCircle(firstPoint.x, firstPoint.y, size/2, paint as Paint)
                paint!!.style = Paint.Style.FILL_AND_STROKE
            }
            runnables.removeAt(0)
        })
        handler.postDelayed(runnables.last(), time)
    }

    open fun drawCircleTimer(point: Vec2, time: Long, opacity: Int, color: Int, size: Float) {
        runnables.add(Runnable {
            paint!!.style = Paint.Style.FILL
            paint!!.color = Color.argb(opacity, Color.red(color), Color.green(color), Color.blue(color))
            paint!!.strokeWidth = size
            canvas?.drawCircle(point.x, point.y, size/2, paint as Paint)
            paint!!.style = Paint.Style.FILL_AND_STROKE
        })
        handler.postDelayed(runnables.last(), time)
    }

    open fun pauseDrawing() {
        timeRemainingDraw = 0
        for (r in runnables) handler.removeCallbacks(r)
    }

    open fun resumeDrawing() {
        for (r in runnables) {
            handler.postDelayed(r, timeRemainingDraw)
            timeRemainingDraw += timePerPoint
        }
    }

    open fun reset() {
        for (r in runnables) handler.removeCallbacks(r)
        canvas?.drawColor(Color.WHITE)
        strokes.clear()
    }


}