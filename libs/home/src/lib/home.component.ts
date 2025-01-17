import { Observable, Subject } from 'rxjs';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';

import * as fromHome from './+state/home.reducer';
import * as fromAuth from '@angular-ngrx-nx-realworld-example-app/auth';
import { Home, HomeState } from './+state/home.interfaces';
import { homeInitialState } from './+state/home.init';
import { withLatestFrom, tap, takeUntil } from 'rxjs/operators';
import * as fromArticleList from '@angular-ngrx-nx-realworld-example-app/article-list';
import { ArticleListConfig } from '@angular-ngrx-nx-realworld-example-app/article-list';
import { articleListInitialState, ArticleListFacade } from '@angular-ngrx-nx-realworld-example-app/article-list';
import { AuthFacade } from '@angular-ngrx-nx-realworld-example-app/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  listConfig$: Observable<ArticleListConfig>;
  tags$: Observable<string[]>;
  isAuthenticated: boolean;
  unsubscribe$: Subject<void> = new Subject();

  constructor(
    private store: Store<any>,
    private router: Router,
    private articleListFacade: ArticleListFacade,
    private authFacade: AuthFacade
  ) {}

  ngOnInit() {
    this.authFacade.isLoggedIn$.pipe(takeUntil(this.unsubscribe$)).subscribe(isLoggedIn => {
      this.isAuthenticated = isLoggedIn;
      this.getArticles();
    });
    this.listConfig$ = this.articleListFacade.listConfig$;
    this.tags$ = this.store.select(fromHome.getTags);
  }

  setListTo(type: string = 'ALL') {
    this.store.dispatch(
      new fromArticleList.SetListConfig(<ArticleListConfig>{
        ...articleListInitialState.listConfig,
        type
      })
    );
  }

  getArticles() {
    if (this.isAuthenticated) {
      this.setListTo('FEED');
    } else {
      this.setListTo('ALL');
    }
  }

  setListTag(tag: string) {
    this.store.dispatch(
      new fromArticleList.SetListConfig(<ArticleListConfig>{
        ...articleListInitialState.listConfig,
        filters: {
          ...articleListInitialState.listConfig.filters,
          tag
        }
      })
    );
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
