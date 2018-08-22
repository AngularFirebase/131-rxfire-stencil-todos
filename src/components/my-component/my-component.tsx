/// <reference types="firebase" />
declare var firebase: firebase.app.App;

import { Component, State } from '@stencil/core';

import { authState } from 'rxfire/auth';
import { collectionData } from 'rxfire/firestore';

import { switchMap } from 'rxjs/operators';

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true
})
export class MyComponent {
  @State()
  todos;

  @State()
  user;

  ref = firebase.firestore().collection('todos');

  componentWillLoad() {
    authState(firebase.auth()).subscribe(u => (this.user = u));

    // Get associated user todos
    authState(firebase.auth())
      .pipe(
        switchMap(user => {
          // Define the query
          if (user) {
            const query = this.ref.where('user', '==', user.uid);
            return collectionData(query, 'taskId');
          } else {
            return [];
          }
        })
      )
      .subscribe(docs => (this.todos = docs));
  }

  login() {
    var provider = new (firebase.auth as any).GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
  }

  logout() {
    firebase.auth().signOut();
  }

  addTask(user) {
    this.ref.add({ user: user.uid, task: 'blank task' });
  }

  removeTask(id) {
    this.ref.doc(id).delete();
  }

  render() {
    if (this.user) {
      return (
        <div>
          You're logged in as {this.user.displayName}
          <button onClick={this.logout}>Logout</button>
          <hr />
          <ul>
            {this.todos.map(todo => (
              <li onClick={() => this.removeTask(todo.taskId)}>
                Task ID: {todo.taskId}
              </li>
            ))}
          </ul>
          <button onClick={() => this.addTask(this.user)}>Add Task</button>
        </div>
      );
    } else {
      return (
        <div>
          <button onClick={this.login}>Login with Google</button>
        </div>
      );
    }
  }
}
