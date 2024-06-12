import { CommonModule } from '@angular/common';
import { AfterContentChecked, AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FuseValidators } from '@fuse/validators';
import { UsuariosService } from '../../usuarios.service';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-usuario-modal',
    templateUrl: './usuario-modal.component.html',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, FormsModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule, MatSelectModule]
})
export class UsuarioModalComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    title: string = '';
    usuarioForm: FormGroup;

    showData: boolean = false;

    usuario: any = {};

    Toast: any;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<UsuarioModalComponent>,
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _usuariosService: UsuariosService,
    ) {
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

    ngOnInit(): void {

        this.title = this.data.title;

        this.usuarioForm = this._formBuilder.group({
                nombre: ['', Validators.required],
                apellido: ['', Validators.required],
                correo: ['', Validators.compose([Validators.required, Validators.email])],
                rol: ['', Validators.required],
                password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
                passwordConfirm: ['', Validators.required],
            },{
                validators: FuseValidators.mustMatch('password', 'passwordConfirm'),
            },
        );

        // this.usuarioForm.reset();
        if(this.data.action === 'edit') {
            this.usuario = this.data.usuario;
            const usuario = this.data.usuario;
            let data = {
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo: usuario.email,
                rol: usuario.rol,
                password: '',
                passwordConfirm: '',
            }

            this.usuarioForm.patchValue(data);
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    cerrarDialogo() {
        this.dialogRef.close('cancelar');
    }

    guardarUsuario() {
        if(!this.usuarioForm.valid) {
            this.Toast.fire({
                icon: 'error',
                title: "Debes completar todos los campos."
            });
            return;
        }

        this.usuarioForm.disable();

        const usuario = this.usuarioForm.value;

        let data = {
            email: usuario.correo,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            rol: usuario.rol,
            password: usuario.password,
        }

        if(this.data.action === 'create') {
            this.crearUsuario(data);
        }else{
            this.editarUsuario(data);
        }
        // this.crearUsuario(data);
    }

    crearUsuario(data:any) {
        this._usuariosService.createUsuario(data).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                if(response.ok){
                    this.Toast.fire({
                        icon: 'success',
                        title: response.message
                    });
                    this.dialogRef.close('exito');
                }else{
                    this.Toast.fire({
                        icon: 'error',
                        title: response.message
                    });

                    this.usuarioForm.enable();
                }
            },(error) => {
                this.Toast.fire({
                    icon: 'error',
                    title: error.error.message
                });

                this.usuarioForm.enable();

            }
        );
    }

    editarUsuario(data:any) {
        this._usuariosService.updateUsuario(data, this.usuario.id).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                if(response.ok){
                    this.Toast.fire({
                        icon: 'success',
                        title: response.message
                    });
                    this.dialogRef.close('exito');
                }else{
                    this.Toast.fire({
                        icon: 'error',
                        title: response.message
                    });

                    this.usuarioForm.enable();

                }
            },(error) => {
                this.Toast.fire({
                    icon: 'error',
                    title: error.error.message
                });

                this.usuarioForm.enable();

            }
        );
    }
}
