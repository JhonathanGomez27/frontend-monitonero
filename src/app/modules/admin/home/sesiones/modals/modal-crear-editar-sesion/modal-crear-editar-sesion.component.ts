import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Subject } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMaterialTimepickerModule, NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import Swal from 'sweetalert2';

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

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<ModalCrearEditarSesionComponent>,
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
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

        let data = {
            nombre : dataForm.tema,
            responsable : dataForm.responsable,
            fecha : this.transformDate(dataForm.fecha._d),
            hora : dataForm.hora,
        }

        console.log(data);
        // this.dialogRef.close('guardar');
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
}
