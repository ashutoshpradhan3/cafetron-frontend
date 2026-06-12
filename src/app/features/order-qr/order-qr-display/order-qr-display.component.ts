import { ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { OrderQRService } from "../order-qr.service";
import { CommonModule } from "@angular/common";

@Component({
    standalone: true,
    imports: [CommonModule],
    selector: 'order-qr-display',
    templateUrl: './order-qr-display.component.html',
    styleUrl: './order-qr-display.component.css'
})
export class OrderQRDisplayComponent implements OnInit {

    @Input({ required: true })
    orderId: number = 0;
    
    base64QRString: string = '';

    constructor(
        private orderQRService: OrderQRService,
        private cdr: ChangeDetectorRef
    ){}

    ngOnInit(): void {
        this.orderQRService.getQR(this.orderId).subscribe({
            next: (result) => {

                this.base64QRString = result.base64QRString;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed:', err);
            }
        });
    }
}