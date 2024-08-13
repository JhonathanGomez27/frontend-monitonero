import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-prueba',
  template: '<canvas #canvas></canvas>',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prueba.component.html',
  styleUrl: './prueba.component.scss'
})
export class PruebaComponent implements OnInit, OnDestroy{
    @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  private audioContext!: AudioContext;
  private analyser!: AnalyserNode;
  private dataArray!: Uint8Array;
  private canvasCtx!: CanvasRenderingContext2D;
  private animationFrameId: number | undefined;
  noiseDetected: boolean = false;

  ngOnInit(): void {
    this.canvasCtx = this.canvas.nativeElement.getContext('2d')!;
    this.startAudioCapture();
  }

  ngOnDestroy(): void {
    // Detener el bucle de dibujo
    if (this.animationFrameId !== undefined) {
        cancelAnimationFrame(this.animationFrameId);
      }

      // Detener el contexto de audio y liberar recursos
      if (this.audioContext) {
        this.audioContext.close().then(() => {
          console.log('Audio context closed');
        });
      }

      console.log('Component destroyed and resources cleaned up');
  }

  startAudioCapture() {
    navigator.mediaDevices.enumerateDevices().then(devices => {
        console.log(devices);
        devices.forEach(device => {
            console.log(device.kind + ": " + device.label +
            " id = " + device.deviceId);
        });
    });

    navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: 'default' } } })
      .then((stream) => {
        this.setupWebAudio(stream);
      })
      .catch(err => {
        console.error('Error accessing audio stream:', err);
      });
  }

  setupWebAudio(stream: MediaStream) {
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(stream);

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);

    source.connect(this.analyser);
    this.draw();
  }

  draw() {
    this.animationFrameId = requestAnimationFrame(() => this.draw());

    this.analyser.getByteFrequencyData(this.dataArray);

    // Llamada a la función para verificar si hay ruido
    this.checkForNoise();

    // Aquí puedes agregar código para visualizar el espectro si lo deseas
    const width = this.canvas.nativeElement.width;
    const height = this.canvas.nativeElement.height;
    this.canvasCtx.clearRect(0, 0, width, height);

    const barWidth = (width / this.dataArray.length) * 2.5;
    let barHeight: number;
    let x = 0;

    for (let i = 0; i < this.dataArray.length; i++) {
      barHeight = this.dataArray[i] / 2;
      this.canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
      this.canvasCtx.fillRect(x, height - barHeight / 2, barWidth, barHeight);
      x += barWidth + 1;
    }
  }

  checkForNoise() {
    // Calcula el promedio de las frecuencias
    const averageFrequency = this.dataArray.reduce((sum, value) => sum + value, 0) / this.dataArray.length;

    // Establece un umbral para detectar ruido
    if (averageFrequency > 50) { // Puedes ajustar este umbral según sea necesario
      this.noiseDetected = true;
    //   console.log('Noise detected based on frequency analysis');
    } else {
      this.noiseDetected = false;
    //   console.log('No noise detected');
    }
  }
}
