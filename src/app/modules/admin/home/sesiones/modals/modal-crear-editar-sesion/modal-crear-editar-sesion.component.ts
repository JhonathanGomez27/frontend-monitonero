import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Subject, takeUntil } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMaterialTimepickerModule, NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import Swal from 'sweetalert2';
import { HomeService } from '../../../home.service';
import moment from 'moment';

@Component({
  selector: 'app-modal-crear-editar-sesion',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, FormsModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule, MatSelectModule, MatDatepickerModule, NgxMaterialTimepickerModule],
  templateUrl: './modal-crear-editar-sesion.component.html'
})
export class ModalCrearEditarSesionComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    title: string = '';
    accion: string = '';

    sesionForm: UntypedFormGroup;

    newTheme: NgxMaterialTimepickerTheme = {
        container: {
            buttonColor: '#c99f4f'
        },
        dial: {
            dialBackgroundColor: '#c99f4f',
        },
        clockFace: {
            clockHandColor: '#c99f4f',
        }
    };

    Toast: any;

    sesionEditar: any = {};

    minDate = new Date();

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<ModalCrearEditarSesionComponent>,
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _homeService: HomeService,
    ) {
        this.title = data.title;
        this.accion = data.accion;

        this.sesionForm = this._formBuilder.group({
            tema: ['', Validators.required],
            responsable: ['', Validators.required],
            fecha: ['', Validators.required],
            hora: ['', Validators.required],
        });

        this.Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            },
        });

        if(data.accion === 'editar') {
            this.sesionEditar = data.data;
            this.sesionForm.patchValue({
                tema: this.sesionEditar.tema,
                responsable: this.sesionEditar.responsable,
                fecha: this.convertirDate(this.sesionEditar.fecha),
                hora: this.sesionEditar.hora
            });

            this._changeDetectorRef.markForCheck();
        }
    }

    ngOnInit() {}

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    cerrarDialogo() {
        this.dialogRef.close('cancelar');
    }

    //-----------------------------------
    // Metodos sesion
    //-----------------------------------
    guardarSesion() {
        if(!this.sesionForm.valid) {
            this.Toast.fire({
                icon: 'error',
                title: `Debes completar todos los campos para ${this.accion} la sesión.`
            });
            return;
        }

        const dataForm = this.sesionForm.getRawValue();
        // console.log(dataForm);
        let data = {
            tema : dataForm.tema,
            responsable : dataForm.responsable,
            fecha_inicio_sesion : this.transformDate(dataForm.fecha._d),
            hora_inicio_sesion : dataForm.hora,
            comision_id: 1
        }

        // return;

        if(this.data.accion === 'crear') {
            this.crearSesion(data);
        }else{
            delete data.comision_id;
            this.editarSesion(data);
        }
        // this.dialogRef.close('guardar');
    }

    crearSesion(data:any){
        this._homeService.crearSesion(data).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                if(response.ok){
                    this.Toast.fire({
                        icon: 'success',
                        title: 'Sesión creada correctamente.'
                    });
                    this.dialogRef.close('guardar');
                }
            },(error) => {
                this.Toast.fire({
                    icon: 'error',
                    title: 'Error al crear la sesión.'
                });
            }
        );
    }

    editarSesion(data:any){
        this._homeService.editarSesion(data, this.sesionEditar.id).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                if(response.ok){
                    this.Toast.fire({
                        icon: 'success',
                        title: 'Sesión editada correctamente.'
                    });
                    this.dialogRef.close('guardar');
                }
            },(error) => {
                this.Toast.fire({
                    icon: 'error',
                    title: 'Error al editar la sesión.'
                });
            }
        );
    }

    //-----------------------------------
    // Metodos adicionales
    //-----------------------------------
    transformDate(date: any): any {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    }


    convertirDate(data: any): any {
        let dateN = new Date(data.replace(/-/g, '/'));
        let fechaMoment = moment(dateN);
        // console.log(dateN);
        return fechaMoment;
    }
}
