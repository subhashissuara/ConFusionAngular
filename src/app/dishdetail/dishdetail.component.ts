import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { Comment } from '../shared/comment';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  tmpDish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  comment: Comment;
  commentForm: FormGroup;
  @ViewChild('cform') commentFormDirective;
  commentStatus: boolean;
  errorMessage: string;

  formErrors = {
    'author': '',
    'comment': ''
  };

  validationMessages = {
    'author': {
      'required': 'Author is required.',
      'minlength': 'Author must be at least 2 characters long.',
      'maxlength': 'Author cannot be more than 35 characters long.'
    },
    'comment': {
      'required': 'Comment is required.',
      'minlength': 'Comment must be at least 2 characters long.',
      'maxlength': 'Comment cannot be more than 255 characters long.'
    }
  };

  constructor(private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL) {
      this.createForm();
    }

  ngOnInit() {
    // Get all dish ids
    this.dishService.getDishIds()
      .subscribe((dishIds) => this.dishIds = dishIds);

    this.route.params.pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
      // tslint:disable-next-line: max-line-length
      .subscribe((dish) => { this.dish = dish; this.tmpDish = dish; this.setPrevNext(dish.id); }, errmessage => this.errorMessage = <any>errmessage);
  }

  createForm() {
    this.commentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(35)]],
      rating: ['5'],
      comment: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]]
    });

    // Subscribe to the value changes observable of comment form
    // to perform form validation as the value changes
    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set form validation messages
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) {
      return;
    }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }

    // display input if author name is not null
    if ( (this.commentForm.get('author').value !== '') || (this.commentForm.get('comment').value !== '')) {
      this.commentStatus = true;
    } else {
      this.commentStatus = false;
    }

  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

  onSubmit() {
    // reset comment status to hide comment preview
    this.commentStatus = false;

    // push comment to dish comments array in the dish model
    this.comment = this.commentForm.value;
    this.comment.date = new Date().toISOString();
    this.tmpDish.comments.push(this.comment);

    this.dishService.getDish(Number(this.tmpDish.id))
      .subscribe(dish => {
        this.dish = dish; this.tmpDish = dish;
      },
      errmessage => { this.dish = null; this.tmpDish = null; this.errorMessage = <any>errmessage; });

    // reset comment form values and pristine state
    this.commentFormDirective.resetForm();
    this.commentForm.reset({
      author: '',
      rating: 5,
      comment: ''
    });
  }
}
