import { User } from '@angular-ngrx-nx-realworld-example-app/api';
import { AuthFacade } from '@angular-ngrx-nx-realworld-example-app/auth';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { combineLatest, map, takeUntil, tap } from 'rxjs/operators';

import { Profile, ProfileState } from './+state/profile.interfaces';
import * as fromProfile from './+state/profile.reducer';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit, OnDestroy {
  profile$: Observable<Profile>;
  currentUser$: Observable<User>;
  isUser$: Subject<boolean> = new Subject();
  unsubscribe$: Subject<void> = new Subject();
  following: boolean;
  username: string;

  constructor(private store: Store<ProfileState>, private authFacade: AuthFacade) {}

  ngOnInit() {
    this.profile$ = this.store.select(fromProfile.getProfile);
    this.currentUser$ = this.authFacade.user$;

    this.profile$
      .pipe(
        combineLatest(this.currentUser$),
        tap(([p, u]) => {
          this.username = p.username;
          this.following = p.following;
        }),
        map(([p, u]) => p.username === u.username),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(isUser => this.isUser$.next(isUser));
  }

  toggleFollowing() {
    if (this.following) {
      this.store.dispatch({
        type: '[profile] UNFOLLOW',
        payload: this.username
      });
    } else {
      this.store.dispatch({
        type: '[profile] FOLLOW',
        payload: this.username
      });
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
