"""
Help command
~~~~~~~~~~~~~~~~~~~

The help command of the bot. This module should only be loaded as a cog

:copyright: (c) 2022-present Mirage Aegis
:license: MIT, see LICENSE for more details.
"""
from os import listdir
import json
import discord
from discord import option, OptionChoice
from discord.ext import commands


class Help(commands.Cog):
    misc_commands: list[OptionChoice] = [
        OptionChoice("credits", "credits"),
        OptionChoice("help", "help"),
        OptionChoice("info", "info"),
        OptionChoice("ping", "ping"),
        OptionChoice("status", "status")
    ]
    mod_commands: list[OptionChoice] = [
        OptionChoice("ban", "ban"),
        OptionChoice("kick", "kick"),
        OptionChoice("unban", "unban")
    ]
    bot_commands: list[OptionChoice] = [
        *misc_commands,
        *mod_commands
    ]

    def __init__(self, bot: discord.Bot):
        self.bot = bot
        self.command_data: dict = dict()

        for file in listdir("./data/commands"):
            if not file.endswith(".json"):
                continue

            # Loads all command data for help commands on start
            # This is to increase performance during runtime
            with open(f"./data/commands/{file}", "r") as f:
                self.command_data[file[:-5]] = json.load(f)

    @commands.slash_command()
    @option(
        "topic",
        description="The topic to get more information about",
        choices=bot_commands,
        required=False
    )
    async def help(self, ctx: discord.ApplicationContext, topic: str):
        if topic is not None:
            data = self.command_data[topic]

            e = discord.Embed(
                title=data["title"],
                colour=discord.Colour.magenta(),
                description=data["description"]
            )\
                .set_author(
                    name="Help",
                    icon_url=ctx.guild.icon.url
                )

            for field in data["fields"]:
                e.add_field(name=field["name"], value=field["value"],inline=False)
        else:
            e = discord.Embed(
                title="General help",
                colour=discord.Colour.magenta(),
                description="These are the commands offered by Sushi Bot. Some commands have certain notations that "
                            "mean different things.\n"
                            "Parameters without any notation are required.\n"
                            "[parameters] denoted like this are optional."
                            "<values> denoted like this indicate that you should replace the angled brackets with a "
                            "value.\n"
                            "Use `/help topic:<topic>` to get help for a specific command!"
            )\
                .set_author(
                name="Help",
                icon_url=ctx.guild.icon.url
            )\
                .add_field(
                    name="Miscellaneous Commands",
                    value=", ".join([f"`/{o.name}`" for o in self.misc_commands]),
                    inline=False
                )\
                .add_field(
                    name="Moderation Commands",
                    value=", ".join([f"`/{o.name}`" for o in self.mod_commands]),
                    inline=False
                )

        await ctx.send_response(embed=e)


def setup(bot: discord.Bot):
    bot.add_cog(Help(bot))
