"""
Core moderation commands
~~~~~~~~~~~~~~~~~~~

The basic moderation commands of the bot. This module should only be loaded as a cog

:copyright: (c) 2022-present Mirage Aegis
:license: MIT, see LICENSE for more details.
"""
import discord
from discord.ext import commands


class Ping(commands.Cog):

    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.slash_command(description="Get the bot's responsetime")
    async def ping(self, ctx: discord.ApplicationContext):
        await ctx.send_response(f":ping_pong: {round(self.bot.latency * 1000)} ms")


def setup(bot: commands.Bot):
    bot.add_cog(Ping(bot))
