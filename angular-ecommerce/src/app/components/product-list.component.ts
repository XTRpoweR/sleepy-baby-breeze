import { Component } from '@angular/core';

interface Product {
  id: number;
  name: string;
  price: number;
}

@Component({
  selector: 'app-product-list',
  template: `
    <h2>Products</h2>
    <div *ngFor="let product of products">
      {{ product.name }} - {{ product.price | currency }}
      <button (click)="addToCart(product)">Add to cart</button>
    </div>
  `
})
export class ProductListComponent {
  products: Product[] = [
    { id: 1, name: 'Sample Product 1', price: 9.99 },
    { id: 2, name: 'Sample Product 2', price: 19.99 }
  ];

  addToCart(product: Product) {
    console.log('Add to cart', product);
  }
}
