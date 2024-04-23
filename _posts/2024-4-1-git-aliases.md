---
layout: post
title: Git Alias Ideas
---

Customize Git commands for your needs with Git Aliases.

Git is an awesome tool that is widely used by many developers. For those of us who prefer using command line, there is a useful feature provided by Git out of the box, and it is the topic for this post. With git aliases we can configure git commands in a desired manner to reduce the amount of routine operations required to work with version control system.

> 💡Define aliases for commands that you use actively. Instead of repeating multiple commands every time, create aliases and use them.

# Ways to define Alias

The are two ways to create an alias:
- use command line
- use `.gitconfig` file directly

> 💡For straightforward scenarios where your goal is to create a shortcut for a Git command, using the command line is the best option. However, for more complex cases, such as defining a shell script, it's better to edit the `.gitconfig` file directly.

# Ideas for Aliases

## Switching to key branches
Let's say you contribute to several projects with the same git flow and branching model. In this case, it can be 
useful to have a command that can make a checkout of the most commonly used branch for you. I truly believe, that in 
many teams developers have an convention to use **`dev`** branch for development purposes. In this case, you can use the following aliases:

``` js
[alias]
	dev = checkout dev	
	dev-pull = !sh -c 'git checkout dev && git pull'
```

As you see, these commands could be used for checkout the `dev` branch which is actively used by developers. However, the second command combines switching the branch and pulling changes. This is one of possible patterns of using git aliases.

> 💡Aliases can be used for combining commands
>
> In addition to using aliases as shortcuts for commands, you can also combine several commands that need to be executed consecutively into a single one.

## Opening URLs

Sometimes, I need to navigate to the remote repository during different steps of working on a task. The most common scenario for me is when I need to create a pull request to ask my teammates for peer review. Below are a couple of ideas for aliases:

``` js
[alias]
	browse = "!f(){\
            url=$(git remote -v|grep origin|\
            head -n 1|awk '{print $2}');\
            start $url & }; f"
	pr = "!f(){\
		url=$(git remote -v|grep origin|\
		head -n 1|awk '{print $2}');\
		start $url/pulls & }; f"
```

In the code snippet above, two commands were defined: browse and pr. The first one can be used to open the remote repository based on the provided URL for your local repository. The second command serves a similar purpose, but instead of a remote repository URL, it opens the URL with a 'pullrequests' suffix. This allows you to directly access the page dedicated to creating pull requests on GitHub. With this shortcut, you can proceed to creating a pull request without additional actions such as searching for the repository in your browser bookmarks or navigating to the pull requests page.

> 💡`PR` command may need adjustments from your side
>
> You may need to adjust it for your needs in case if you work with other service than GitHub. For example in case if you use Azure DevOps the url will be a bit different

``` js	
pr = "!f(){url=$(git remote -v|grep origin|\
		head -n 1|awk '{print $2}');\
		start $url/pullrequests & }; f"
```

# Summary

Git Aliases is a great tool that can be used to make our lifes easier. Some common patterns of utilizing this feature include:
- creating custom shortcuts for commands
- checkout key branches
- combining multiple commands
- executing complex commands and shell scripts 

> The main goal of this article is to showcase how I use git aliases and inspire you for try this feature in your work! 
Happy coding!

# References
[Git Basics - Git Aliases](https://git-scm.com/book/en/v2/Git-Basics-Git-Aliases)
