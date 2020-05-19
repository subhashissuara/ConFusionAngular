import { Component, OnInit, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Promotion } from '../shared/promotion';
import { PromotionService } from '../services/promotion.service';
import { Leader } from '../shared/leader';
import { LeaderService } from '../services/leader.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  dish: Dish;
  dishErrMess: string;
  promotion: Promotion;
  promotionErrMess: string;
  leader: Leader;
  leaderErrMess: string;

  constructor(private dishService: DishService, private promotionService: PromotionService,
    private leaderService: LeaderService,
    @Inject('BaseURL') private BaseURL) { }

  ngOnInit() {
    this.dishService.getFeaturedDish().subscribe(dish => this.dish = dish, errmess => this.dishErrMess = <any>errmess);
    // tslint:disable-next-line: max-line-length
    this.promotionService.getFeaturedPromotion().subscribe(promotion => this.promotion = promotion, errmess => this.promotionErrMess = <any>errmess);
    this.leaderService.getFeaturedLeader().subscribe(leader => this.leader = leader, errmess => this.leaderErrMess = <any>errmess);
  }

}
